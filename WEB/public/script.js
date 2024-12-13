
const audio = document.getElementById("background-audio");
const muteButton = document.getElementById("mute-button");
const volumeSlider = document.getElementById("volume");
const audioConsent = document.getElementById("audio-consent");
const form = document.getElementById("comment-form");
const commentsList = document.getElementById("comments-list");

// Управление звуком
function allowAudio() {
    audioConsent.style.display = 'none';
    audio.play();
}

function denyAudio() {
    audioConsent.style.display = 'none';
    audio.muted = true;
}

muteButton.addEventListener("click", () => {
    audio.muted = !audio.muted;
    muteButton.textContent = audio.muted ? "🔇" : "🔊";
});

volumeSlider.addEventListener("input", (event) => {
    audio.volume = event.target.value;
});

// Загрузка комментариев
async function loadComments() {
    try {
        const response = await fetch('/api/comments');
        if (!response.ok) throw new Error('Ошибка при загрузке комментариев');
        const comments = await response.json();

        // Очищаем список перед добавлением
        commentsList.innerHTML = '';

        // Добавляем загруженные комментарии сверху
        comments.forEach(({ nickname, comment }) => {
            const commentItem = document.createElement("li");
            commentItem.innerHTML = `${nickname} : ${comment}`;
            commentsList.prepend(commentItem);  // Добавляем комментарий в начало списка
        });
    } catch (error) {
        console.error('Ошибка при загрузке комментариев:', error);
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nickname = document.getElementById("nickname").value;
    const comment = document.getElementById("comment").value;

    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, comment }),
        });

        if (!response.ok) throw new Error('Ошибка при добавлении комментария');

        // Обновляем список комментариев после добавления
        loadComments();

        // Сброс формы
        form.reset();
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
    }
});

loadComments();
