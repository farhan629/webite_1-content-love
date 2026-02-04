// Main JS for general site functionality
document.addEventListener('DOMContentLoaded', () => {
    // Prioritize Static Config, fall back to localStorage
    const localData = JSON.parse(localStorage.getItem('romanticSiteData')) || {};
    const configData = window.CONFIG || {};
    
    // Merge logic: localData wins for live preview/editing, configData is for prod fallback
    const data = { ...configData, ...localData };

    if (data) {
        const yesBtn = document.getElementById('yesBtn');
        const noBtn = document.getElementById('noBtn');
        const letter = document.getElementById('letterContent');
        const thankYou = document.getElementById('thankYouMsg');

        if (yesBtn && data.yesText) yesBtn.innerText = data.yesText;
        if (noBtn && data.noText) noBtn.innerText = data.noText;
        if (letter && data.letter) letter.innerText = data.letter;
        if (thankYou && data.thankYou) thankYou.innerText = data.thankYou;
    }
});
