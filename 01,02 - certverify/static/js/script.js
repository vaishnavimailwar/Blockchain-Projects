// script.js
// Small UX helpers for the Certificate Verification Using Blockchain project.
// Click any hash / ID displayed in monospace to copy it to the clipboard.

document.addEventListener("DOMContentLoaded", function () {
    const copyableSelectors = ".mono.break, .highlight";
    document.querySelectorAll(copyableSelectors).forEach(function (el) {
        el.style.cursor = "pointer";
        el.title = "Click to copy";
        el.addEventListener("click", function () {
            const text = el.textContent.trim();
            if (!text) return;
            navigator.clipboard.writeText(text).then(function () {
                const original = el.style.color;
                el.style.color = "#16a34a";
                setTimeout(function () {
                    el.style.color = original;
                }, 400);
            });
        });
    });

    // Auto-dismiss flash messages after a few seconds
    document.querySelectorAll(".flash").forEach(function (flash) {
        setTimeout(function () {
            flash.style.transition = "opacity 0.4s";
            flash.style.opacity = "0";
            setTimeout(function () { flash.remove(); }, 400);
        }, 5000);
    });

    // Show the selected filename next to file inputs for a nicer feel
    document.querySelectorAll('input[type="file"]').forEach(function (input) {
        input.addEventListener("change", function () {
            if (input.files && input.files.length > 0) {
                input.title = input.files[0].name;
            }
        });
    });
});
