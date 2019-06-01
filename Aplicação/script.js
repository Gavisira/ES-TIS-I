var sHtml = '';
var mesAtual = '';
var anoAtual = '';
var d = new Date();
var usuarioAtivo = -1;
var botao1 = true, botao2 = true;
var indiceEdicao;

// Caso exista no LocalStorage, recupera os dados salvos. Caso contrário, cria a partir do arquivo JSON
var dados = JSON.parse(localStorage.getItem('dados'));
if (!dados) {
    dados = contas.usuarios;
    localStorage.setItem('dados', JSON.stringify(dados));
};

function recuperar() {
    $("#form-login")[0].reset();
    document.getElementById("login").classList.toggle("invisible");
    document.getElementById("esqueci").classList.toggle("invisible");
}

function registrar() {
    $("#form-login")[0].reset();
    document.getElementById("login").classList.toggle("invisible");
    document.getElementById("cadastro").classList.toggle("invisible");
}

function cancelar(id) {
    if (id == "esqueci") {
        $("#form-recupera")[0].reset();
    }
    if (id == "cadastro") {
        $("#form-cadastro")[0].reset();
    }
    if (id == "config") {
        $("#form-config")[0].reset();
    }
    document.getElementById("login").classList.toggle("invisible");
    document.getElementById(id).classList.toggle("invisible");
}

function recuperaDados() {
    // Verfica se o formulário está preenchido corretamente
    if (!$('#form-recupera')[0].checkValidity()) {
        displayMessage("Preencha o formulário corretamente.");
        return;
    }
    // Obtem os valores dos campos do formulário
    let campoNome = $("#inputLembraNome").val();
    let campoSobrenome = $("#inputLembraSobrenome").val();
    let campoEmail = $("#inputLembraEmail").val();
    // Verifica se o nome e e-mail do usuário já existem
    for (i = 0; i < dados.length; i++) {
        if (campoEmail == dados[i].email) {
            if (campoNome == dados[i].nome && campoSobrenome == dados[i].sobrenome) {
                displayMessage("Usuário: <b>" + dados[i].nickname + "</b> &nbsp &nbsp &nbsp &nbsp &nbsp Senha: <b>" + dados[i].senha + "</b>");
                return;
            }
            else {
                displayMessage("Nome e/ou e-mail incorreto(s).");
                return;
            }
        }
    }
    displayMessage("E-mail não cadastrado.");
}

function cadastrar() {
    // Verfica se o formulário está preenchido corretamente
    if (!$('#form-cadastro')[0].checkValidity()) {
        displayMessage("Preencha o formulário corretamente.");
        return;
    }
    // Obtem os valores dos campos do formulário
    let campoNome = $("#inputName").val();
    let campoSobrenome = $("#inputLastName").val();
    let campoEmail = $("#inputEmail").val();
    let campoNick = $('#inputUserCad').val();
    let campoSenha = $('#inputPasswordCad').val();
    // Verifica se o e-mail e nome de usuário já existem
    for (i = 0; i < dados.length; i++) {
        if (campoEmail == dados[i].email) {
            displayMessage("E-mail já cadastrado.");
            return;
        }
        else if (campoNick == dados[i].nickname) {
            displayMessage("Nome de usuário indisponível.");
            return;
        }
    }
    // Prepara os dados para cadastro do usuário
    let newUser = {
        "nome": campoNome,
        "sobrenome": campoSobrenome,
        "email": campoEmail,
        "nickname": campoNick,
        "senha": campoSenha,
        "transacoes": [],
    };
    dados.push(newUser);
    displayMessage("Usuário cadastrado com sucesso!");
    // Atualiza os dados no Local Storage
    localStorage.setItem('dados', JSON.stringify(dados));
    // Volta para a tela inicial de login
    cancelar("cadastro");
}

function acessar() {
    // Verfica se o formulário está preenchido corretamente
    if (!$('#form-login')[0].checkValidity()) {
        displayMessage("Preencha o formulário corretamente.");
        return;
    }
    // Obtem os valores dos campos do formulário
    let campoNick = $('#inputUser').val();
    let campoSenha = $('#inputPassword').val();
    // Verifica se os dados estão corretos no banco de dados
    for (i = 0; i < dados.length; i++) {
        if (campoNick == dados[i].nickname && campoSenha == dados[i].senha) {
            displayMessage("<b>" + dados[i].nome + "</b>, seja bem vindo!");
            $("#form-login")[0].reset();
            usuarioAtivo = i;
            let db = dados[usuarioAtivo].transacoes;
            if (db.length == 0) {
                document.getElementById("login").classList.toggle("invisible");
                document.getElementById("config").classList.toggle("invisible");
                return;
            }
            else {
                document.getElementById("inicio").classList.toggle("invisible");
                document.getElementById("conteudo").classList.toggle("invisible");
                if (db.length == 1) {
                    loadMes(1);
                }
                else {
                    loadMes();
                }
                document.getElementById("usuario").innerHTML = dados[usuarioAtivo].nome + ' ' + dados[usuarioAtivo].sobrenome;
                return;
            }
        }
    }
    displayMessage("Usuário não encontrado ou senha incorreta.");
}

function continuar() {
    // Verfica se o formulário está preenchido corretamente
    if (!$('#form-config')[0].checkValidity()) {
        displayMessage("Preencha o formulário corretamente.");
        return;
    }
    // Obtem os valores dos campos do formulário
    let campoSaldo = $('#inputSaldo').val();
    let campoData = $('#inputDataSaldo').val();
    let data = new Date(campoData);
    // Prepara os dados para cadastro do usuário
    let newSaldo = {
        "id": 01,
        "vencimento": {
            "data": campoData,
            "dia": data.getUTCDate(),
            "mes": data.getUTCMonth() + 1,
            "ano": data.getUTCFullYear(),
        },
        "historico": "Saldo Inicial",
        "complemento": "",
        "realizado": "",
        "entrada": "",
        "saida": "",
        "saldo": campoSaldo,
    };
    let db = dados[usuarioAtivo].transacoes;
    db[0] = newSaldo;
    $("#form-config")[0].reset();
    displayMessage("Saldo inicial configurado com sucesso!");
    cancelar("config");
    document.getElementById("inicio").classList.toggle("invisible");
    document.getElementById("conteudo").classList.toggle("invisible");
    // Atualiza os dados no Local Storage
    localStorage.setItem('dados', JSON.stringify(dados));
    loadMes(1);
    document.getElementById("usuario").innerHTML = dados[usuarioAtivo].nome + ' ' + dados[usuarioAtivo].sobrenome;
}

// Exibe mensagem em um elemento de ID msg
function displayMessage(msg) {
    $('#msg').bind("DOMSubtreeModified", function () {
        window.setTimeout(function () {
            $(".alert").fadeTo(500, 0).slideUp(500, function () {
                $(this).remove();
                document.getElementById("msg").classList.toggle("frente");
            });
        }, 2500);
    });
    // Acrescenta classe à DIV para ficar à frente da DIV branca-transparente
    document.getElementById("msg").classList.toggle("frente");
    // Insere os dados da mensagem de alerta na DIV e exibe a mensagem
    $('#msg').html('<div class="alert alert-danger">' + msg + '</div>');
}

function loadMes(inicial) {
    if (inicial == 1) {
        let campoData = new Date(dados[usuarioAtivo].transacoes[0].vencimento.data);
        mesAtual = campoData.getUTCMonth() + 1;
        anoAtual = campoData.getUTCFullYear();
    }
    else {
        mesAtual = d.getUTCMonth() + 1;
        anoAtual = d.getUTCFullYear();
    }
    loadData();
    inicial = 0;
}

function mesanterior() {
    if (mesAtual == 1) {
        mesAtual = 12;
        anoAtual--;
    }
    else {
        mesAtual--;
    }
    loadData();
}

function proximomes() {
    if (mesAtual == 12) {
        mesAtual = 1;
        anoAtual++;
    }
    else {
        mesAtual++;
    }
    loadData();
}

function loadData(novo) {
    document.getElementById("table-apps").innerHTML = '';
    botao1 = true;
    botao2 = true;
    mudaBotoes();
    let db = dados[usuarioAtivo].transacoes;
    let acabou = false;
    let indice = 0;
    let somaEntrada = 0, somaSaida = 0, saldoAtualizado;
    let dataAtual = '';
    let realizadoAux, campoRealizado;
    // Inserir a única linha para Saldo Inicial ou carregar mais registros
    if (db.length == 1) {
        let campoData = new Date(db[0].vencimento.data);
        if (db[0].realizado != "") {
            realizadoAux = new Date(db[0].realizado);
            campoRealizado = realizadoAux.toLocaleDateString();
        }
        else {
            campoRealizado = "";
        }
        sHtml = `<tr onclick="editar(${db[0].id})"><td class="id">1</td><td
        class="data">${campoData.getUTCDate()}/${campoData.getUTCMonth() + 1}/${campoData.getUTCFullYear()}</td><td
        class="texto">${db[0].historico}</td><td class="texto">${db[0].complemento}</td><td
        class="data">${campoRealizado}</td><td class="valor pos">${db[0].entrada}</td><td
        class="valor neg">${db[0].saida}</td><td class="valor">${parseFloat(db[0].saldo).toFixed(2)}</td></tr>`;
        botao1 = false;
        botao2 = false;
    }
    else {
        //procura pelo ano atual no banco de dados, contabilizando as movimentações
        while (acabou == false) {
            let millisec = Date.parse(db[indice].vencimento.data);
            let campoData = new Date(millisec);
            if (mesAtual < 10) {
                let constroiData = anoAtual + '-0' + mesAtual + '-01';
                let msec = Date.parse(constroiData);
                dataAtual = new Date(msec);
            }
            else {
                let constroiData = anoAtual + '-' + mesAtual + '-01';
                let msec = Date.parse(constroiData);
                dataAtual = new Date(msec);
            }
            if (campoData < dataAtual) {
                if (db[indice].entrada != "") {
                    somaEntrada += parseFloat(db[indice].entrada);
                }
                else if (db[indice].saida != "") {
                    somaSaida += parseFloat(db[indice].saida);
                }
                indice++;
                if (indice == db.length) {
                    acabou = true;
                }
            }
            else {
                acabou = true;
            }
        }
        acabou = false;
        saldoAtualizado = parseFloat(db[0].saldo) + somaEntrada - somaSaida;
        i = indice;
        if (i < db.length) {
            let campoData = new Date(db[i].vencimento.data);
            if (db[i].realizado != "") {
                realizadoAux = new Date(db[i].realizado);
                campoRealizado = realizadoAux.toLocaleDateString();
            }
            else {
                campoRealizado = "";
            }
            // Inserir linha de Saldo Inicial se o mês for o do início da base de dados
            //Se primeira linha do relatório for o Saldo Inicial (registro índice 0)
            if (i == 0) {
                sHtml = `<tr onclick="editar(${db[i].id})"><td class="id">1</td><td
                    class="data">${campoData.getUTCDate()}/${campoData.getUTCMonth() + 1}/${campoData.getUTCFullYear()}</td><td
                    class="texto">${db[i].historico}</td><td class="texto">${db[i].complemento}</td><td
                    class="data">${campoRealizado}</td><td class="valor pos">${db[i].entrada}</td><td
                    class="valor neg">${db[i].saida}</td><td class="valor">${saldoAtualizado.toFixed(2)}</td></tr>`;
                botao1 = false;
            }
            else {
                sHtml = `<tr></tr><tr><td class="id">1</td><td class="data"></td><td class="texto">Saldo Anterior</td>
                    <td class="texto"></td><td class="data"></td><td class="valor pos"></td><td class="valor neg"></td>
                    <td class="valor"> ${saldoAtualizado.toFixed(2)} </td></tr>`;
            }
            //carrega os registros do banco de dados para preencher a tabela referente ao mes atual, com saldo anterior atualizado
            for (i = indice, j = 2; i < db.length; i++) {
                if (mesAtual == db[i].vencimento.mes) {
                    let campoData = new Date(db[i].vencimento.data);
                    if (db[i].realizado != "") {
                        realizadoAux = new Date(db[i].realizado);
                        campoRealizado = realizadoAux.toLocaleDateString();
                    }
                    else {
                        campoRealizado = "";
                    }
                    if (db[i].entrada != "") {
                        pos = parseFloat(db[i].entrada);
                        saldoAtualizado += pos;
                        sHtml += `<tr onclick="editar(${db[i].id})"><td class="id">${j}</td><td
                            class="data">${campoData.getUTCDate()}/${campoData.getUTCMonth() + 1}/${campoData.getUTCFullYear()}</td><td
                            class="texto">${db[i].historico}</td><td class="texto">${db[i].complemento}</td><td
                            class="data">${campoRealizado}</td><td class="valor pos">${pos.toFixed(2)}</td><td
                            class="valor neg">${db[i].saida}</td><td class="valor">${saldoAtualizado.toFixed(2)}</td></tr>`;
                        j++;
                    }
                    else if (db[i].saida != "") {
                        neg = parseFloat(db[i].saida);
                        saldoAtualizado -= neg;
                        sHtml += `<tr onclick="editar(${db[i].id})"><td class="id">${j}</td><td
                            class="data">${campoData.getUTCDate()}/${campoData.getUTCMonth() + 1}/${campoData.getUTCFullYear()}</td><td
                            class="texto">${db[i].historico}</td><td class="texto">${db[i].complemento}</td><td
                            class="data">${campoRealizado}</td><td class="valor pos">${db[i].entrada}</td><td
                            class="valor neg">${neg.toFixed(2)}</td><td class="valor">${saldoAtualizado.toFixed(2)}</td></tr>`;
                        j++;
                    }
                    if (i == db.length - 1) {
                        botao2 = false;
                    }
                }
                else {
                    i = db.length;
                }
            }
        }
        else {
            sHtml = `<tr></tr><tr><td class="id">1</td><td class="data"></td><td class="texto">Saldo Anterior</td>
                <td class="texto"></td><td class="data"></td><td class="valor pos"></td><td class="valor neg"></td>
                <td class="valor"> ${saldoAtualizado.toFixed(2)} </td></tr>`;
            botao2 = false;
        }
    }
    mudaBotoes();
    document.getElementById("table-apps").innerHTML = sHtml;
    document.getElementById("atual").innerHTML = meses.results[mesAtual - 1].nome + ' / ' + anoAtual;
}

function mudaBotoes() {
    if (botao1 == false) {
        document.getElementById("mesAnt").style.display = "none";
    }
    else {
        document.getElementById("mesAnt").style.display = "";
    }
    if (botao2 == false) {
        document.getElementById("mesProx").style.display = "none";
    }
    else {
        document.getElementById("mesProx").style.display = "";
    }
    if (document.getElementById("mesAnt").style.display == "none" && document.getElementById("mesProx").style.display == "none") {
        document.getElementById("atual").style.width = "100%";
    }
    else if ((document.getElementById("mesAnt").style.display == "" && document.getElementById("mesProx").style.display == "none") || (document.getElementById("mesAnt").style.display == "none" && document.getElementById("mesProx").style.display == "")) {
        document.getElementById("atual").style.width = "85%";
    }
    else {
        document.getElementById("atual").style.width = "70%";
    }
}

function trocaTelas(edicao) {
    document.getElementById("opaco").classList.toggle("invisible");
    document.getElementById("novoLanc").classList.toggle("invisible");
    resetForm();
    if (edicao == "edicao") {
        document.getElementById("inputSalvar").style.display = "none";
        document.getElementById("inputExcluir").style.display = "block";
        document.getElementById("inputSalvaMais").style.display = "none";
        document.getElementById("inputAltera").style.display = "block";
        document.getElementById("inputDuplicar").style.display = "block";
    }
    else {
        document.getElementById("inputSalvar").style.display = "";
        document.getElementById("inputExcluir").style.display = "";
        document.getElementById("inputSalvaMais").style.display = "";
        document.getElementById("inputAltera").style.display = "";
        document.getElementById("inputDuplicar").style.display = "";
    }
    edicao = "cadastra";
}

function habilitaData(status) {
    if (status == true) {
        document.getElementById("done").disabled = false;
    } else {
        document.getElementById("done").disabled = true;
    }
}

function resetForm() {
    $("#form-lancamento")[0].reset();
    let form = document.querySelector('#form-lancamento');
    form[0].disabled = false;
    form[1].disabled = false;
    form[2].disabled = false;
    form[3].disabled = false;
    form[4].checked = false;
    form[4].disabled = false;
    form[5].disabled = true;
    form[6].checked = false;
    form[6].disabled = false;
    form[7].checked = false;
    form[7].disabled = false;
    form[10].disabled = false;
    form[11].disabled = false;
    form[12].disabled = false;
}

function novoRegistro(continua) {
    let db = dados[usuarioAtivo].transacoes;
    // Verfica se o formulário está preenchido corretamente
    if (!$('#form-lancamento')[0].checkValidity()) {
        displayMessage("Preencha o formulário corretamente.");
        return;
    }
    // Obtem os valores dos campos do formulário
    let form = document.querySelector('#form-lancamento');
    let campoHistorico = form[0].value;
    let campoComplemento = form[1].value;
    let campoEntrada, campoSaida, campoRealizado;
    if (form[6].checked == true) {
        campoEntrada = form[2].value;
        campoSaida = "";
    }
    else if (form[7].checked == true) {
        campoEntrada = "";
        campoSaida = form[2].value;
    }
    let campoData = form[3].value;
    let data = new Date(campoData);
    if (continua == 1) { //para excluir
        if (confirm("Deseja realmente excluir este lançamento?")) {
            db.splice(indiceEdicao, 1);
            displayMessage("Lançamento excluído com sucesso!");
        }
        else {
            return;
        }
    }
    else {
        if (continua == 2) { //para salvar edicao
            if (confirm("Deseja salvar as alterações deste lançamento?")) {
                db.splice(indiceEdicao, 1);
            }
            else {
                return;
            }
        }
        else if (continua == 4) { // para duplicar
            if (confirm("Deseja duplicar este lançamento?\nO lançamento original será preservado e acrescentado outro lançamento com os valores informados.")) {
            }
            else {
                return;
            }
        }
        let novoId = verificaId(campoData);
        if (form[4].checked == true) {
            campoRealizado = form[5].value;
        }
        else {
            campoRealizado = "";
        }
        // Prepara os dados para cadastro do usuário
        let rec = {
            "id": novoId,
            "vencimento": {
                "data": campoData,
                "dia": data.getUTCDate(),
                "mes": data.getUTCMonth() + 1,
                "ano": data.getUTCFullYear(),
            },
            "historico": campoHistorico,
            "complemento": campoComplemento,
            "realizado": campoRealizado,
            "entrada": campoEntrada,
            "saida": campoSaida,
            "saldo": "",
        };
        db.splice(novoId - 1, 0, rec);
        if (continua == 2) {
            displayMessage("Alterações cadastradas com sucesso!");
        }
        else if (continua == 4) {
            displayMessage("Lançamento duplicado com sucesso!");
        }
        else {
            displayMessage("Lançamento cadastrado com sucesso!");
        }
    }
    reordenaId();
    // Atualiza os dados no Local Storage
    localStorage.setItem('dados', JSON.stringify(dados));
    loadData();
    resetForm();
    if (continua != 3) {
        trocaTelas();
    }
    continua = 0;
}

function editar(id) {
    indiceEdicao = id - 1;
    resetForm();
    let form = document.querySelector('#form-lancamento');
    trocaTelas("edicao");
    let db = dados[usuarioAtivo].transacoes;
    // Obtem os valores do banco de dados e os carrega nos campos do formulário
    form[0].value = db[id - 1].historico;
    form[1].value = db[id - 1].complemento;
    form[3].value = db[id - 1].vencimento.data;
    if (db[id - 1].historico == "Saldo Inicial") {
        form[0].disabled = true;
        form[1].disabled = true;
        form[2].value = db[id - 1].saldo;
        form[2].disabled = true;
        document.getElementById("dataVenc").innerHTML = "Data inicial: *";
        form[3].disabled = true;
        form[4].disabled = true;
        form[5].disabled = true;
        form[6].disabled = true;
        form[7].disabled = true;
        form[10].disabled = true;
        form[11].disabled = true;
        form[12].disabled = true;
    }
    else {
        if (db[id - 1].entrada != "") {
            form[2].value = db[id - 1].entrada;
            form[6].checked = true;
        }
        else if (db[id - 1].saida != "") {
            form[2].value = db[id - 1].saida;
            form[7].checked = true;
        }
    }
    if (db[id - 1].realizado != "") {
        form[4].checked = true;
        form[5].disabled = false;
        form[5].value = db[id - 1].realizado;
    }
    else {
        form[4].checked = false;
        form[5].disabled = true;
    }
    //db.splice(novoId - 1, 0, rec);
    document.getElementById("dataVenc").innerHTML = "Vencimento: *";
}

// Verifica o número do ID a ser atribuído ao novo registro para ordem cronológica de inserção
function verificaId(novaData) {
    let db = dados[usuarioAtivo].transacoes;
    for (i = 0; i < db.length; i++) {
        if (novaData < db[i].vencimento.data) {
            let id = i + 1;
            return id;
        }
    }
    let id = db.length + 1;
    return id;
}

// Reordena os números ID dos registros
function reordenaId() {
    let obj = dados[usuarioAtivo].transacoes;
    for (i = 0; i < obj.length; i++) {
        if (i != (obj[i].id + 1)) {
            obj[i].id = i + 1;
        }
    }
}

function excluir() {
    if (confirm("Deseja realmente excluir sua conta? Todos os seus dados serão apagados.")) {
        dados.splice(usuarioAtivo, 1);
        logoff();
        displayMessage("Conta de usuário excluída com sucesso!");
        // Atualiza os dados no Local Storage
        localStorage.setItem('dados', JSON.stringify(dados));
    }
}

function logoff() {
    usuarioAtivo = -1;
    document.getElementById("inicio").classList.toggle("invisible");
    document.getElementById("conteudo").classList.toggle("invisible");
}