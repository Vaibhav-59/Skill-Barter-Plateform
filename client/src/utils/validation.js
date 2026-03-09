export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  
  if (!/^[A-Z]/.test(password)) {
    return "First character must be uppercase";
  }
  
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    return "Password must contain at least one symbol (@$!%*?&)";
  }
  
  return "";
};

export const validateForm = (fields) => {
  return Object.values(fields).every((val) => val?.trim() !== "");
};
