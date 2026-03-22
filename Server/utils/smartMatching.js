// /server/utils/smartMatching.js
// ─────────────────────────────────────────────────────────────────────────────
// SmartMatchingAlgorithm v2 – profile-aware multi-factor scoring
// Uses every field the user can fill in their EditProfile page:
//   teachSkills / learnSkills, experienceLevel, yearsOfExperience, availability,
//   location, learningStyle, teachingStyle, languages, bio, verifiedSkills,
//   githubData, totalReviews, averageRating, lastLogin
// ─────────────────────────────────────────────────────────────────────────────

const skillSimilarity = require("./skillSimilarity");

class SmartMatchingAlgorithm {
  // ── Weights ───────────────────────────────────────────────────────────────
  static WEIGHTS = {
    skillMatch:          0.28, // Most critical – can they trade skills?
    mutualExchange:      0.15, // Both teach what the other wants?
    experienceBalance:   0.10, // Complementary levels drive learning
    learningStyleFit:    0.08, // Learning ↔ teaching style alignment
    availabilityOverlap: 0.08, // Scheduling compatibility
    languageMatch:       0.07, // Communication language overlap
    locationScore:       0.05, // Same city / country convenience
    verifiedSkillBonus:  0.05, // Platform-verified skills add trust
    reputationScore:     0.06, // Reviews & rating
    activityScore:       0.04, // Recency of login / activity
    githubScore:         0.02, // GitHub presence (developer signal)
    bioCompleteness:     0.02, // Profile completeness signal
  };

  // ── Public API ────────────────────────────────────────────────────────────
  static calculateMatchScores(user, potentialMatches, userHistory = []) {
    const scoredMatches = potentialMatches.map((potential) => {
      const compat = this.calculateCompatibility(user, potential, userHistory);
      return {
        user: potential,
        compatibilityScore: compat.total,
        breakdown: compat.breakdown,
        confidence: compat.confidence,
        reasons: compat.reasons,
        matchType: this.determineMatchType(compat),
        highlights: compat.highlights,
      };
    });

    return scoredMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  // ── Core compatibility ────────────────────────────────────────────────────
  static calculateCompatibility(user, potential, userHistory) {
    const skillResult   = this.calculateSkillMatch(user, potential);
    const mutualResult  = this.calculateMutualExchange(user, potential);
    const expResult     = this.calculateExperienceBalance(user, potential);
    const styleResult   = this.calculateLearningStyleFit(user, potential);
    const availResult   = this.calculateAvailabilityOverlap(user, potential);
    const langResult    = this.calculateLanguageMatch(user, potential);
    const locResult     = this.calculateLocationScore(user, potential);
    const verResult     = this.calculateVerifiedSkillBonus(user, potential);
    const repResult     = this.calculateReputationScore(potential);
    const actResult     = this.calculateActivityScore(potential);
    const ghResult      = this.calculateGithubScore(potential);
    const bioResult     = this.calculateBioCompleteness(potential);
    const histResult    = this.calculateHistoricalSuccess(user, potential, userHistory);

    const factors = {
      skillMatch:          skillResult,
      mutualExchange:      mutualResult,
      experienceBalance:   expResult,
      learningStyleFit:    styleResult,
      availabilityOverlap: availResult,
      languageMatch:       langResult,
      locationScore:       locResult,
      verifiedSkillBonus:  verResult,
      reputationScore:     repResult,
      activityScore:       actResult,
      githubScore:         ghResult,
      bioCompleteness:     bioResult,
    };

    let totalScore = 0;
    let totalConfidence = 0;
    const breakdown = {};
    const reasons = [];
    const highlights = [];

    for (const [key, result] of Object.entries(factors)) {
      const w = this.WEIGHTS[key] ?? 0;
      const weighted = result.value * w;
      totalScore += weighted;
      totalConfidence += result.confidence * w;

      breakdown[key] = {
        raw: result.value,
        weighted,
        weight: w,
        explanation: result.explanation,
      };

      if (result.value >= 0.75 && result.explanation) {
        reasons.push(result.explanation);
      }
      if (result.highlight) {
        highlights.push(result.highlight);
      }
    }

    // History bonus (additive, capped)
    const histBonus = (histResult.value - 0.5) * 0.08;
    totalScore = Math.min(1, Math.max(0, totalScore + histBonus));

    // Mutual exchange synergy bonus
    if (mutualResult.value >= 0.7 && skillResult.value >= 0.65) {
      totalScore = Math.min(1, totalScore + 0.05);
      reasons.unshift("Perfect two-way skill exchange opportunity!");
    }

    return {
      total:      Math.round(totalScore * 100),
      breakdown,
      confidence: Math.round(totalConfidence * 100),
      reasons:    reasons.slice(0, 4),
      highlights: highlights.slice(0, 6),
    };
  }

  // ── Factor 1 – Skill Match ─────────────────────────────────────────────── 
  // Current user's teachSkills ↔ potential's learnSkills (one direction)
  static calculateSkillMatch(user, potential) {
    const myTeach  = user.skillsOffered    || user.teachSkills    || [];
    const theirWant= potential.skillsWanted|| potential.learnSkills|| [];
    const theirTeach= potential.skillsOffered|| potential.teachSkills|| [];
    const myWant   = user.skillsWanted     || user.learnSkills    || [];

    const fwd = this._bestCrossScore(myTeach, theirWant);
    const rev = this._bestCrossScore(theirTeach, myWant);

    const score = Math.max(fwd.best, rev.best, (fwd.best + rev.best) / 2 * 0.9);
    const matchedPairs = [...fwd.matches, ...rev.matches];

    let explanation = "Limited skill overlap";
    let highlight = null;
    if (score >= 0.85) {
      explanation = matchedPairs[0] || "Excellent skill match";
      highlight = `🎯 ${matchedPairs[0] || "Strong skill alignment"}`;
    } else if (score >= 0.6) {
      explanation = matchedPairs[0] || "Good skill compatibility";
    }

    return {
      value: Math.min(score, 1),
      confidence: Math.min(myTeach.length + theirTeach.length, 6) / 6,
      explanation,
      highlight,
    };
  }

  // ── Factor 2 – Mutual Exchange ────────────────────────────────────────────
  // Are BOTH directions satisfied? This is the holy grail.
  static calculateMutualExchange(user, potential) {
    const myTeach   = user.skillsOffered     || user.teachSkills    || [];
    const theirWant = potential.skillsWanted  || potential.learnSkills|| [];
    const theirTeach= potential.skillsOffered || potential.teachSkills|| [];
    const myWant    = user.skillsWanted       || user.learnSkills    || [];

    const fwd = this._bestCrossScore(myTeach, theirWant);
    const rev = this._bestCrossScore(theirTeach, myWant);

    const isMutual = fwd.best >= 0.6 && rev.best >= 0.6;
    const score = isMutual
      ? Math.min(1, (fwd.best + rev.best) / 2 + 0.15)
      : Math.max(fwd.best, rev.best) * 0.5;

    return {
      value: score,
      confidence: 0.85,
      explanation: isMutual ? "Mutual skill exchange – you both teach what the other wants!" : "One-way skill sharing",
      highlight: isMutual ? "🔄 Two-way skill swap!" : null,
    };
  }

  // ── Factor 3 – Experience Balance ─────────────────────────────────────────
  // yearsOfExperience + experienceLevel both considered
  static calculateExperienceBalance(user, potential) {
    const lvlMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };

    const uLvl  = lvlMap[(user.experienceLevel || "").toLowerCase()] || 2;
    const pLvl  = lvlMap[(potential.experienceLevel || "").toLowerCase()] || 2;
    const lvlDiff = Math.abs(uLvl - pLvl);

    // yoe complements the level
    const uYoe = Math.min(user.yearsOfExperience || 0, 15);
    const pYoe = Math.min(potential.yearsOfExperience || 0, 15);
    const yoeDiff = Math.abs(uYoe - pYoe);
    const yoeScore = Math.max(0, 1 - yoeDiff / 10); // normalized

    let lvlScore;
    if      (lvlDiff === 0) lvlScore = 0.65;  // same – okay
    else if (lvlDiff === 1) lvlScore = 0.90;  // 1 apart – great
    else if (lvlDiff === 2) lvlScore = 1.00;  // 2 apart – ideal mentor/mentee
    else                    lvlScore = 0.30;  // too far

    const score = (lvlScore * 0.7 + yoeScore * 0.3);
    const expLabel = `${user.experienceLevel || "intermediate"} ↔ ${potential.experienceLevel || "intermediate"}`;

    return {
      value: score,
      confidence: 0.8,
      explanation: `Experience balance: ${expLabel}`,
      highlight: lvlDiff === 2 ? `📈 Ideal mentor-learner pair (${expLabel})` : null,
    };
  }

  // ── Factor 4 – Learning / Teaching Style Fit ──────────────────────────────
  // User's learningStyle should match potential's teachingStyle
  static calculateLearningStyleFit(user, potential) {
    const STYLE_COMPAT = {
      "Visual":              ["Project-based", "Hands-on", "Step-by-step guidance"],
      "Auditory":            ["Lecture-based", "Discussion-based"],
      "Reading/Writing":     ["Lecture-based", "Step-by-step guidance"],
      "Hands-on":            ["Hands-on", "Project-based"],
      "Interactive":         ["Discussion-based", "Project-based"],
    };

    const uLearn = user.learningStyle || "";
    const pTeach = potential.teachingStyle || "";

    if (!uLearn || !pTeach) {
      return { value: 0.5, confidence: 0.3, explanation: "Learning style data not specified" };
    }

    const compatible = STYLE_COMPAT[uLearn] || [];
    const isMatch = compatible.includes(pTeach);
    const score = isMatch ? 1.0 : uLearn === pTeach ? 0.7 : 0.3;

    return {
      value: score,
      confidence: 0.75,
      explanation: isMatch
        ? `Your ${uLearn} learning style fits their ${pTeach} teaching!`
        : `Learning style: ${uLearn} vs teaching: ${pTeach}`,
      highlight: isMatch ? `✨ Learning-teaching style match!` : null,
    };
  }

  // ── Factor 5 – Availability Overlap ───────────────────────────────────────
  static calculateAvailabilityOverlap(user, potential) {
    const uSlots = this._parseAvailability(user.availability);
    const pSlots = this._parseAvailability(potential.availability);

    if (uSlots.length === 0 || pSlots.length === 0) {
      return { value: 0.5, confidence: 0.3, explanation: "Availability not specified" };
    }

    const common = uSlots.filter((s) => pSlots.includes(s));
    const ratio  = common.length / Math.max(uSlots.length, pSlots.length);
    const score  = Math.min(1, ratio * 1.2); // slight boost

    return {
      value: score,
      confidence: 0.7,
      explanation: score > 0.5 ? `${common.length} overlapping time slots` : "Limited scheduling overlap",
      highlight: score >= 0.75 ? `🗓️ Great scheduling overlap (${common.length} slots)` : null,
    };
  }

  // ── Factor 6 – Language Match ──────────────────────────────────────────────
  static calculateLanguageMatch(user, potential) {
    const uLangs = (user.languages || []).map((l) => l.toLowerCase());
    const pLangs = (potential.languages || []).map((l) => l.toLowerCase());

    if (uLangs.length === 0 || pLangs.length === 0) {
      return { value: 0.5, confidence: 0.3, explanation: "Languages not specified" };
    }

    const common = uLangs.filter((l) => pLangs.includes(l));
    if (common.length === 0) {
      return { value: 0.2, confidence: 0.7, explanation: "No common language" };
    }

    const score = Math.min(1, common.length / Math.min(uLangs.length, pLangs.length));
    return {
      value: score,
      confidence: 0.8,
      explanation: `Shared languages: ${common.slice(0, 3).join(", ")}`,
      highlight: common.length >= 2 ? `🌐 ${common.length} shared languages` : null,
    };
  }

  // ── Factor 7 – Location Score ──────────────────────────────────────────────
  static calculateLocationScore(user, potential) {
    const uLoc = user.location || {};
    const pLoc = potential.location || {};
    const uCity    = (uLoc.city    || "").toLowerCase().trim();
    const uCountry = (uLoc.country || "").toLowerCase().trim();
    const pCity    = (pLoc.city    || "").toLowerCase().trim();
    const pCountry = (pLoc.country || "").toLowerCase().trim();

    if (!uCity && !uCountry && !pCity && !pCountry) {
      return { value: 0.5, confidence: 0.3, explanation: "Location not specified" };
    }

    let score = 0.25;
    let explanation = "Different locations – remote collaboration";
    if (uCountry && pCountry && uCountry === pCountry) {
      score = 0.65;
      explanation = "Same country";
    }
    if (uCity && pCity && uCity === pCity) {
      score = 1.0;
      explanation = "Same city – can meet in person!";
    }

    return {
      value: score,
      confidence: 0.8,
      explanation,
      highlight: score === 1.0 ? `📍 Same city as you!` : null,
    };
  }

  // ── Factor 8 – Verified Skill Bonus ────────────────────────────────────────
  static calculateVerifiedSkillBonus(user, potential) {
    const myWant    = (user.skillsWanted    || user.learnSkills    || []).map((s) => (typeof s === "string" ? s : s.name || "").toLowerCase());
    const theirVerified = (potential.verifiedSkills || []).map((s) => s.toLowerCase());

    if (theirVerified.length === 0) {
      return { value: 0.4, confidence: 0.4, explanation: "No verified skills", highlight: null };
    }

    const matchedVerified = myWant.filter((skill) =>
      theirVerified.some((v) => v.includes(skill) || skill.includes(v))
    );

    const score = matchedVerified.length > 0
      ? Math.min(1, 0.6 + matchedVerified.length * 0.15)
      : theirVerified.length > 0 ? 0.55 : 0.4;

    return {
      value: score,
      confidence: 0.9,
      explanation: matchedVerified.length > 0
        ? `Has ${matchedVerified.length} verified skill(s) you want to learn`
        : `Has ${theirVerified.length} platform-verified skills`,
      highlight: matchedVerified.length > 0
        ? `✅ Verified in: ${matchedVerified.slice(0, 2).join(", ")}`
        : null,
    };
  }

  // ── Factor 9 – Reputation Score ────────────────────────────────────────────
  static calculateReputationScore(potential) {
    const rating = potential.averageRating || 0;
    const reviews = potential.totalReviews || 0;

    if (reviews === 0) {
      return { value: 0.5, confidence: 0.3, explanation: "No reviews yet – new user" };
    }

    const ratingScore = (rating - 1) / 4;                        // 1-5 → 0-1
    const confidenceScore = Math.min(reviews / 10, 1);           // saturates at 10 reviews
    const score = ratingScore * 0.8 + confidenceScore * 0.2;

    return {
      value: Math.max(0, Math.min(1, score)),
      confidence: confidenceScore,
      explanation: rating >= 4.5
        ? `Top-rated user (${rating}⭐ from ${reviews} reviews)`
        : rating >= 4
        ? `Highly rated (${rating}⭐)`
        : `${rating}⭐ · ${reviews} reviews`,
      highlight: rating >= 4.5 && reviews >= 5
        ? `⭐ Top-rated: ${rating}/5 (${reviews} reviews)`
        : null,
    };
  }

  // ── Factor 10 – Activity Score ──────────────────────────────────────────────
  static calculateActivityScore(potential) {
    const lastLogin = potential.lastLogin || potential.lastActive || potential.updatedAt;
    if (!lastLogin) return { value: 0.5, confidence: 0.3, explanation: "Activity unknown" };

    const daysSince = (Date.now() - new Date(lastLogin)) / 86_400_000;

    let score, explanation;
    if (daysSince <= 1)  { score = 1.0;  explanation = "Active today"; }
    else if (daysSince <= 7)  { score = 0.85; explanation = "Active this week"; }
    else if (daysSince <= 30) { score = 0.60; explanation = "Active this month"; }
    else if (daysSince <= 90) { score = 0.35; explanation = "Less active recently"; }
    else                      { score = 0.15; explanation = "Inactive for a while"; }

    return {
      value: score,
      confidence: 0.9,
      explanation,
      highlight: score >= 0.85 ? "🟢 Recently active" : null,
    };
  }

  // ── Factor 11 – GitHub Score ────────────────────────────────────────────────
  static calculateGithubScore(potential) {
    if (!potential.isGithubConnected || !potential.githubData) {
      return { value: 0.3, confidence: 0.5, explanation: "GitHub not connected" };
    }
    const { reposCount = 0, stars = 0 } = potential.githubData || {};
    const repoScore  = Math.min(reposCount / 20, 1);   // saturates at 20 repos
    const starScore  = Math.min(stars / 100, 1);        // saturates at 100 stars
    const score = repoScore * 0.6 + starScore * 0.4;

    return {
      value: Math.max(0.3, score),
      confidence: 0.7,
      explanation: `GitHub: ${reposCount} repos, ${stars} stars`,
      highlight: stars > 50 ? `💻 ${stars}★ on GitHub` : null,
    };
  }

  // ── Factor 12 – Bio Completeness ────────────────────────────────────────────
  static calculateBioCompleteness(potential) {
    let score = 0;
    const checks = [
      potential.bio && potential.bio.length > 30,
      (potential.teachSkills || potential.skillsOffered || []).length > 0,
      (potential.learnSkills || potential.skillsWanted  || []).length > 0,
      potential.location?.city || potential.location?.country,
      potential.languages?.length > 0,
      potential.learningStyle || potential.teachingStyle,
      potential.profileImage,
    ];

    score = checks.filter(Boolean).length / checks.length;
    return {
      value: score,
      confidence: 0.95,
      explanation: score >= 0.8 ? "Well-completed profile" : score >= 0.5 ? "Decent profile" : "Minimal profile data",
      highlight: score >= 0.8 ? "📋 Highly detailed profile" : null,
    };
  }

  // ── Historical Success ──────────────────────────────────────────────────────
  static calculateHistoricalSuccess(user, potential, userHistory) {
    if (!userHistory || userHistory.length === 0) {
      return { value: 0.5, confidence: 0.2 };
    }
    const similar = userHistory.filter((h) =>
      this._areSimilarUsers(h.matchedUser || h.otherUser, potential)
    );
    if (similar.length === 0) return { value: 0.5, confidence: 0.3 };

    const avgRating =
      similar.reduce((s, h) => s + (h.rating || h.matchRating || 3), 0) / similar.length;
    return {
      value: Math.min(1, (avgRating - 1) / 4),
      confidence: Math.min(similar.length / 5, 1),
    };
  }

  // ── Match Type ──────────────────────────────────────────────────────────────
  static determineMatchType(compat) {
    const b = compat.breakdown || {};
    const skill   = b.skillMatch?.raw        || 0;
    const mutual  = b.mutualExchange?.raw     || 0;
    const style   = b.learningStyleFit?.raw  || 0;
    const rep     = b.reputationScore?.raw    || 0;
    const verified= b.verifiedSkillBonus?.raw || 0;

    if (mutual >= 0.75 && skill >= 0.65)                          return "perfect_match";
    if (skill >= 0.7 && style >= 0.75)                            return "style_aligned";
    if (skill >= 0.65 && verified >= 0.65)                        return "verified_expert";
    if (mutual >= 0.6)                                            return "mutual_learning";
    if (skill >= 0.6 && rep >= 0.7)                               return "trusted_mentor";
    if (compat.total >= 60)                                       return "skill_complement";
    return "potential_match";
  }

  // ── Insights ────────────────────────────────────────────────────────────────
  static getMatchInsights(user, matches) {
    if (matches.length === 0) {
      return { totalMatches: 0, averageCompatibility: 0, recommendations: ["Complete your profile to improve matches"] };
    }
    const avgCompat = Math.round(matches.reduce((s, m) => s + m.compatibilityScore, 0) / matches.length);
    const matchTypes = {};
    matches.forEach((m) => { matchTypes[m.matchType] = (matchTypes[m.matchType] || 0) + 1; });

    const recommendations = [];
    if (avgCompat < 50) recommendations.push("Add more skills to your profile");
    if (!user.learningStyle) recommendations.push("Set your learning style for better style-aligned matches");
    if (!user.languages?.length) recommendations.push("Add your languages to find compatible collaborators");

    return { totalMatches: matches.length, averageCompatibility: avgCompat, matchTypes, recommendations };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────
  static _bestCrossScore(teachSkills, learnSkills) {
    let best = 0;
    const matches = [];
    for (const t of teachSkills) {
      for (const l of learnSkills) {
        const sim = skillSimilarity.calculateSkillSimilarity(t, l);
        if (sim > best) best = sim;
        if (sim >= 0.7) {
          const tName = typeof t === "string" ? t : (t.name || "");
          const lName = typeof l === "string" ? l : (l.name || "");
          matches.push(`${tName} ↔ ${lName}`);
        }
      }
    }
    return { best: Math.min(best, 1), matches: matches.slice(0, 3) };
  }

  static _parseAvailability(availability) {
    if (!availability) return [];
    if (Array.isArray(availability)) return availability.map((s) => s.trim().toLowerCase());
    if (typeof availability === "string") return availability.split(",").map((s) => s.trim().toLowerCase());
    return [];
  }

  static _areSimilarUsers(u1, u2) {
    if (!u1 || !u2) return false;
    const s1 = (u1.skillsOffered || u1.teachSkills || []);
    const s2 = (u2.skillsOffered || u2.teachSkills || []);
    const overlap = this._calculateSkillOverlap(s1, s2);
    return overlap > 0.3;
  }

  static _calculateSkillOverlap(skills1, skills2) {
    if (!skills1.length || !skills2.length) return 0;
    let total = 0;
    for (const s1 of skills1) {
      for (const s2 of skills2) {
        total += skillSimilarity.calculateSkillSimilarity(s1, s2);
      }
    }
    return total / (skills1.length * skills2.length);
  }
}

module.exports = SmartMatchingAlgorithm;
