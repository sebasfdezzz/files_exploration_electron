document.addEventListener("DOMContentLoaded", function() {
    var exploreBtn = document.getElementById("explore");
    var recoverBtn = document.getElementById("recover");
    var systemBtn = document.getElementById("system");
    var settingsBtn = document.getElementById("settings");

    exploreBtn.addEventListener("click", function() {
        window.location.href = "templates/explore.html";
    });

    recoverBtn.addEventListener("click", function() {
        window.location.href = "templates/recover.html";
    });

    systemBtn.addEventListener("click", function() {
        window.location.href = "templates/system.html";
    });

    settingsBtn.addEventListener("click", function() {
        window.location.href = "templates/settings.html";
    });
});
