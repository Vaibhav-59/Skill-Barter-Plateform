const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get user social data
// @route   GET /api/social
// @access  Private
exports.getSocialData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select(
    "githubUrl linkedinUrl twitterUrl portfolioUrl isGithubConnected isLinkedinConnected isTwitterConnected isPortfolioConnected githubData"
  );

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Connect social account (or update existing connection)
// @route   POST /api/social/connect
// @access  Private
exports.connectSocial = asyncHandler(async (req, res, next) => {
  const { platform, url } = req.body;

  if (!platform || !url) {
    return next(new ErrorResponse("Please provide platform and url", 400));
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Update specific platform based on input
  switch (platform.toLowerCase()) {
    case 'github':
      user.githubUrl = url;
      user.isGithubConnected = true;
      break;
    case 'linkedin':
      user.linkedinUrl = url;
      user.isLinkedinConnected = true;
      break;
    case 'twitter':
    case 'x':
      user.twitterUrl = url;
      user.isTwitterConnected = true;
      break;
    case 'portfolio':
      user.portfolioUrl = url;
      user.isPortfolioConnected = true;
      break;
    default:
      return next(new ErrorResponse("Invalid platform", 400));
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Remove an integrated social account
// @route   DELETE /api/social/remove/:platform
// @access  Private
exports.removeSocial = asyncHandler(async (req, res, next) => {
  const platform = req.params.platform;
  
  if (!platform) {
    return next(new ErrorResponse("Please provide a platform to remove", 400));
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  switch (platform.toLowerCase()) {
    case 'github':
      user.githubUrl = '';
      user.isGithubConnected = false;
      user.githubData = { reposCount: 0, stars: 0, languages: [] };
      break;
    case 'linkedin':
      user.linkedinUrl = '';
      user.isLinkedinConnected = false;
      break;
    case 'twitter':
    case 'x':
      user.twitterUrl = '';
      user.isTwitterConnected = false;
      break;
    case 'portfolio':
      user.portfolioUrl = '';
      user.isPortfolioConnected = false;
      break;
    default:
      return next(new ErrorResponse("Invalid platform", 400));
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Fetch GitHub data and save into user model
// @route   GET /api/social/github
// @access  Private
exports.fetchGithubData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user || !user.isGithubConnected || !user.githubUrl) {
    return next(new ErrorResponse("GitHub is not connected", 400));
  }

  try {
    // Extract username from githubUrl
    const urlParts = user.githubUrl.split('/');
    const username = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    
    if (!username) {
        return next(new ErrorResponse("Invalid GitHub URL format", 400));
    }

    // Fetch user basic data
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    const userData = await userRes.json();
    
    // Fetch repos data
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = await reposRes.json();

    let totalStars = 0;
    const languagesMap = {};

    if (Array.isArray(repos)) {
      repos.forEach(repo => {
        totalStars += repo.stargazers_count;
        if (repo.language) {
          languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
        }
      });
    }

    // Sort languages by count
    const topLanguages = Object.entries(languagesMap)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 5); // top 5 languages

    user.githubData = {
      reposCount: userData.public_repos || 0,
      stars: totalStars,
      languages: topLanguages
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user.githubData
    });
  } catch (err) {
    console.error(err);
    // Continue even if GitHub API rate limits us or throws an error
    return next(new ErrorResponse("Failed to fetch GitHub data. Profile might be private or invalid.", 500));
  }
});
