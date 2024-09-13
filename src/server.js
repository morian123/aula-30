const express = require("express");
const fsp = require("fs/promises");
const path = require("path");

const servidor = express();

servidor.use(express.json());

servidor.get("/dado/:nome", async (req, res) => {
  try {
    // const nome = req.params.nome;
    const { nome } = req.params;

    if (!nome) {
      return res
        .status(404)
        .json({ message: "Nome no route params é necessário." });
    }

    const caminhoArquivo = path.join(__dirname, "textos", nome + ".txt");

    if (!caminhoArquivo.endsWith(".txt")) {
      return res
        .status(400)
        .json({ message: "O arquivo precisa ser um arquivo de texto" });
    }

    let dados = await fsp.readFile(caminhoArquivo, "utf8");

    dados = dados
      .split("\r")
      .join("")
      .split("\n")
      .join("")
      .split("\t")
      .filter((linha) => linha.trim() !== "");

    res.status(200).json({ conteudo: dados });
  } catch (erro) {
    if (erro.code === "ENOENT") {
      // Arquivo não encontrado
      res.status(404).json({ erro: "Arquivo não encontrado" });
    } else if (erro.code === "EACCES") {
      // Permissão negada
      res
        .status(403)
        .json({ erro: "Permissão negada ao tentar acessar o arquivo" });
    } else {
      // Outros erros
      console.error("Erro ao ler o arquivo:", erro.message);
      res
        .status(500)
        .json({ erro: "Erro ao ler o arquivo", detalhes: erro.message });
    }
  }
});

servidor.get("/dados", async (_req, res) => {
  try {
    const caminhoDiretorio = path.join(__dirname, "textos");
    const arquivos = await fsp.readdir(caminhoDiretorio);

    const arquivosTexto = arquivos.filter(arquivo => arquivo.endsWith(".txt"));

    res.status(200).json({ arquivosDisponiveis: arquivosTexto });
  } catch (erro) {
    if (erro.code === "ENOENT") {
      // Arquivo não encontrado
      res.status(404).json({ erro: "Arquivo não encontrado" });
    } else if (erro.code === "EACCES") {
      // Permissão negada
      res
        .status(403)
        .json({ erro: "Permissão negada ao tentar acessar o arquivo" });
    } else {
      // Outros erros
      console.error("Erro ao ler o arquivo:", erro.message);
      res
        .status(500)
        .json({ erro: "Erro ao ler o arquivo", detalhes: erro.message });
    }
  }
});

servidor.put("/dado", async (req, res) => {
  try {
    const { nome } = req.query;
    if (!nome) {
      return res
        .status(404)
        .json({ erro: "Nome na consulta não encontrado" });
    }

    let { conteudo } = req.body;
    if (!conteudo || typeof conteudo !== "string" || conteudo.trim() === "") {
      return res
        .status(400)
        .json({ erro: "Conteúdo inválido: deve ser uma string não vazia." });
    }

    const caminhoArquivo = path.join(__dirname, "textos", nome + ".txt");

    let dadosExistentes = await fsp.readFile(caminhoArquivo, "utf8");

    // Adiciona o novo conteúdo ao final do arquivo
    await fsp.writeFile(caminhoArquivo, `${dadosExistentes}\n${conteudo}`);

    res.json({ mensagem: "Conteúdo adicionado com sucesso." });
  } catch (erro) {
    if (erro.code === "EACCES") {
      // Permissão negada
      res
        .status(403)
        .json({ erro: "Permissão negada ao tentar escrever no arquivo" });
    } else {
      console.error("Erro ao escrever no arquivo:", erro.message);
      res
        .status(500)
        .json({ erro: "Erro ao processar o arquivo", detalhes: erro.message });
    }
  }
});

servidor.post("dados", (req, res) => {
  //nome do arquivo = body

  const { nome } = req.body.nome;
  if (!nome) {
    return res
     .status(404)
     .json({ erro: "Nome no body é necessário." });
  }

  //conteudo = body quequest

  //encontrar caminho da pasta aonde o conteudo vai ser criada

  //criar um arquivo com nome do arquivo e conteudo no caminho encontrado

  //nome do arquivp = inserir o conteudo

  //retornar a resposta
})

servidor.listen(3000, () => console.log("Servidor está rodando... 🔥"));