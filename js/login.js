/**
 * login.js
 * Valida usuário e senha fixos:
 *   Usuário: renato
 *   Senha: Marilia
 *
 * Se estiver correto, redireciona para home.html.
 * Caso contrário, mostra mensagem de erro.
 */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = usernameInput.value.trim();
    const pass = passwordInput.value;

    // Verifica credenciais
    if (user === "renato" && pass === "Marilia") {
      // Login correto: redireciona para home.html
      window.location.href = "home.html";
    } else {
      // Login incorreto: exibe mensagem de erro
      errorMsg.textContent = "Usuário ou senha incorretos.";
      // Limpa apenas o campo de senha (opcional)
      passwordInput.value = "";
      passwordInput.focus();
    }
  });
});
