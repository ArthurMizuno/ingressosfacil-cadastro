// ===== Seleção de elementos e constantes =====
const form = document.getElementById("registerForm");
const campos = {
    nome: document.getElementById("nome"),
    telefone: document.getElementById("telefone"),
    email: document.getElementById("email"),
    senha: document.getElementById("senha"),
    confirmar: document.getElementById("confirmar"),
    termos: document.getElementById("termos")
};

const switchNovidades = document.getElementById("novidades");
const mensagem = document.getElementById("mensagem");
const painelSucesso = document.getElementById("painel-sucesso");
const botaoVerSenha = document.getElementById("ver-senha");
const forcaProgresso = document.getElementById("forca-progresso");
const forcaBarra = document.getElementById("forca-barra");
const forcaTexto = document.getElementById("forca-texto");

const CHAVE_STORAGE = "ingressosfacil.usuarios";
const ROTULOS_FORCA = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
const CLASSES_FORCA = ["bg-danger", "bg-danger", "bg-warning", "bg-info", "bg-success"];

// ===== Regras de validação =====
function validarNome(valor) {
    const texto = valor.trim();
    if (texto === "") return "Informe seu nome.";
    if (texto.length < 3) return "O nome deve ter ao menos 3 caracteres.";
    return "";
}

function validarTelefone(valor) {
    const texto = valor.trim();
    if (texto === "") return "Informe seu telefone.";
    if (texto.length < 8) return "Informe um telefone válido.";
    return "";
}

function validarEmail(valor) {
    const texto = valor.trim();
    if (texto === "") return "Informe seu e-mail.";
    const padrao = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!padrao.test(texto)) return "E-mail inválido.";
    return "";
}

function validarSenha(valor) {
    if (valor === "") return "Informe uma senha.";
    if (valor.length < 8) return "A senha deve ter ao menos 8 caracteres.";
    return "";
}

function validarConfirmacao(valor) {
    if (valor === "") return "Repita a senha.";
    if (valor !== campos.senha.value) return "As senhas não conferem.";
    return "";
}

function validarTermos(marcado) {
    return marcado ? "" : "É preciso aceitar os termos de uso.";
}

const validadores = {
    nome: validarNome,
    telefone: validarTelefone,
    email: validarEmail,
    senha: validarSenha,
    confirmar: validarConfirmacao,
    termos: validarTermos
};

// ===== Validação de um campo e exibição do resultado =====
function lerValor(input) {
    return input.type === "checkbox" ? input.checked : input.value;
}

function validarCampo(nomeCampo) {
    const input = campos[nomeCampo];
    const erro = document.getElementById("erro-" + nomeCampo);
    const texto = validadores[nomeCampo](lerValor(input));
    erro.textContent = texto;
    input.classList.toggle("is-invalid", texto !== "");
    input.classList.toggle("is-valid", texto === "");
    return texto === "";
}

// ===== Eventos enquanto o usuário digita ou sai do campo =====
Object.keys(campos).forEach(function (nomeCampo) {
    const input = campos[nomeCampo];
    input.addEventListener("blur", function () {
        validarCampo(nomeCampo);
    });
    input.addEventListener("input", function () {
        if (input.classList.contains("is-invalid")) {
            validarCampo(nomeCampo);
        }
    });
});

campos.senha.addEventListener("input", function () {
    if (campos.confirmar.value !== "") {
        validarCampo("confirmar");
    }
    mostrarForca(campos.senha.value);
});

// ===== Mostrar e ocultar a senha =====
botaoVerSenha.addEventListener("click", function () {
    const estavaVisivel = campos.senha.type === "text";
    campos.senha.type = estavaVisivel ? "password" : "text";
    botaoVerSenha.querySelector("i").className = estavaVisivel ? "bi bi-eye" : "bi bi-eye-slash";
    botaoVerSenha.setAttribute("aria-label", estavaVisivel ? "Mostrar senha" : "Ocultar senha");
});

// ===== Indicador de força da senha =====
function calcularForca(senha) {
    let pontos = 0;
    if (senha.length >= 8) pontos++;
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
    if (/\d/.test(senha)) pontos++;
    if (/[^A-Za-z0-9]/.test(senha)) pontos++;
    return pontos;
}

function mostrarForca(senha) {
    const pontos = calcularForca(senha);
    forcaBarra.style.width = pontos * 25 + "%";
    forcaBarra.className = "progress-bar " + CLASSES_FORCA[pontos];
    forcaProgresso.setAttribute("aria-valuenow", pontos * 25);
    forcaTexto.textContent = senha === "" ? "" : "Força: " + ROTULOS_FORCA[pontos];
}

// ===== Armazenamento localStorage =====
function lerUsuarios() {
    return JSON.parse(localStorage.getItem(CHAVE_STORAGE)) ?? [];
}

function gravarUsuarios(usuarios) {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(usuarios));
}

function exibirComprovante() {
    const usuarios = lerUsuarios();
    painelSucesso.replaceChildren();
    
    if (usuarios.length === 0) {
        return; 
    }

    // Pega apenas o último usuário cadastrado para exibir o comprovante formal
    const ultimoUsuario = usuarios[usuarios.length - 1];

    const cardSucesso = document.createElement("div");
    cardSucesso.className = "card border-success shadow-sm p-4 bg-white";

    const titulo = document.createElement("h4");
    titulo.className = "text-success fw-bold mb-3";
    titulo.textContent = "Parabéns! Seu cadastro foi concluído com sucesso.";

    const divDetalhes = document.createElement("div");
    divDetalhes.className = "d-flex flex-column gap-2 text-dark";

    const pNome = document.createElement("span");
    pNome.innerHTML = `<strong>Nome completo:</strong> ${ultimoUsuario.nome}`;

    const pTel = document.createElement("span");
    pTel.innerHTML = `<strong>Telefone:</strong> ${ultimoUsuario.telefone}`;

    const pEmail = document.createElement("span");
    pEmail.innerHTML = `<strong>E-mail:</strong> ${ultimoUsuario.email}`;

    const pSenha = document.createElement("span");
    pSenha.innerHTML = `<strong>Senha:</strong> *********`; // Senha protegida com asteriscos

    const pData = document.createElement("small");
    pData.className = "text-muted mt-2 pt-2 border-top";
    pData.textContent = `Registrado em: ${ultimoUsuario.criadoEm}`;

    divDetalhes.append(pNome, pTel, pEmail, pSenha, pData);
    cardSucesso.append(titulo, divDetalhes);
    painelSucesso.append(cardSucesso);
}

// ===== Envio do formulário =====
form.addEventListener("submit", function (event) {
    event.preventDefault();
    mensagem.hidden = true;
    let formularioValido = true;

    Object.keys(campos).forEach(function (nomeCampo) {
        if (!validarCampo(nomeCampo)) {
            formularioValido = false;
        }
    });

    if (!formularioValido) {
        form.querySelector(".is-invalid").focus();
        return;
    }

    const usuario = {
        nome: campos.nome.value.trim(),
        telefone: campos.telefone.value.trim(),
        email: campos.email.value.trim().toLowerCase(),
        senha: campos.senha.value, 
        novidades: switchNovidades.checked,
        criadoEm: new Date().toLocaleString("pt-BR")
    };

    const usuarios = lerUsuarios();
    const jaExiste = usuarios.some(function (u) {
        return u.email === usuario.email;
    });

    if (jaExiste) {
        document.getElementById("erro-email").textContent = "Este e-mail já está cadastrado.";
        campos.email.classList.remove("is-valid");
        campos.email.classList.add("is-invalid");
        campos.email.focus();
        return;
    }

    usuarios.push(usuario);
    gravarUsuarios(usuarios);
    form.reset();

    Object.values(campos).forEach(function (input) {
        input.classList.remove("is-valid", "is-invalid");
    });
    mostrarForca("");

    mensagem.textContent = "Cadastro efetuado!";
    mensagem.hidden = false;
    
    // Atualiza o painel exibindo o comprovante formal do novo cadastro
    exibirComprovante();
});

// ===== Estado inicial da página =====
exibirComprovante();