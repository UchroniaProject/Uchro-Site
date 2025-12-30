window.Modules ??= {};
window.Modules.demography ??= {};
window.Modules.demography.init = (ctx) => {
  const root = document.getElementById("demography-overview-root");
  if (root) root.textContent = "Module Démographie chargé.";
};
