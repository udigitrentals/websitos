/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }]
  },
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  roots: ["<rootDir>/tests"],
  moduleNameMapper: {
    "^v2/(.*)$": "<rootDir>/v2/$1"
  }
};
