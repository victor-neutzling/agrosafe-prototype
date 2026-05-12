function showFeedback(message, isError) {
    const feedback = document.getElementById('feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.remove('error', 'success');
    feedback.classList.add(isError ? 'error' : 'success');
}

const cadastroForm = document.getElementById('cadastro-form');
if (cadastroForm) {
    cadastroForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const senha = document.getElementById('senha').value;

        fetch('/appbk/cadastrar/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, cpf, senha })
        })
            .then(response => response.json())
            .then(data => {
                if (data.mensagem) {
                    showFeedback('Cadastro realizado com sucesso! Redirecionando para o login...', false);
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1200);
                    return;
                }
                showFeedback(data.erro || 'Não foi possível cadastrar.', true);
            })
            .catch(() => {
                showFeedback('Erro ao conectar com o servidor.', true);
            });
    });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const cnpj = document.getElementById('cnpj').value.trim();
        const senha = document.getElementById('senha').value;

        fetch('/appbk/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cnpj, senha })
        })
            .then(response => response.json())
            .then(data => {
                if (data.mensagem) {
                    showFeedback('Login realizado com sucesso! Redirecionando...', false);
                    setTimeout(() => {
                        window.location.href = '/porteiro/';
                    }, 700);
                    return;
                }
                showFeedback(data.erro || 'Não foi possível autenticar.', true);
            })
            .catch(() => {
                showFeedback('Erro ao conectar com o servidor.', true);
            });
    });
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        fetch('/appbk/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(() => {
                window.location.href = '/';
            })
            .catch(() => {
                showFeedback('Erro ao realizar logout.', true);
            });
    });
}
