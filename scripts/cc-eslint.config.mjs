export default [
  {
    files: ["**/*.js","**/*.jsx"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    rules: {
      "no-restricted-globals": ["error", { name: "NeuralBus", message: "Use SafeNeuralBus (assets/security/neural-bus-safe.js)" }]
    }
  }
];
