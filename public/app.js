const chagptForms = document.querySelectorAll(".chatgpt-form")
const loadingAnimation = document.querySelector(".spinner-box")

for (let form of chagptForms) {
    form.addEventListener('submit', () => {
        form.classList.add("editing")
        const chagptBtn = document.querySelector(".editing .chatgpt-btn")
        chagptBtn.disabled = true
        form.classList.remove("editing")

        loadingAnimation.style.visibility = "visible"
    })
}

