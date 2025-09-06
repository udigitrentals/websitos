module.exports = {
  "src/**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "src/**/*.{json,md,yml,yaml}": ["prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"], // only root-level configs
};
