const express = require("express");
const fsp = require("fs/promises");
const path = require("path");

const servidor = express();
servidor.use(express.json());

servidor.get("/arquivos", async (req, res) => {
  try {
    // Corrija o caminho para o diretório 'textos'
    const caminhoDiretorio = path.join(__dirname, "textos");

    // Lê o conteúdo da pasta 'textos'
    const arquivos = await fsp.readdir(caminhoDiretorio);

    // Filtra apenas arquivos .txt (opcional)
    const arquivosTxt = arquivos.filter((arquivo) => arquivo.endsWith(".txt"));

    res.status(200).json({ arquivos: arquivosTxt });
  } catch (erro) {
    console.error("Erro ao listar arquivos:", erro.message);
    res.status(500).json({ erro: "Erro ao listar arquivos", detalhes: erro.message });
  }
});

servidor.get("/arquivo", async (req, res) => {
  try {
    const { nome } = req.query;

    if (nome) {
      // Garante que o nome do arquivo seja seguro
      const nomeArquivo = path.basename(nome);
      const caminhoArquivo = path.join(__dirname, "textos", nomeArquivo + ".txt"); // Inclui o caminho correto da pasta

      // Lê o conteúdo do arquivo
      let dados = await fsp.readFile(caminhoArquivo, "utf8");

      // Converte o conteúdo em um array de strings, onde cada linha é um item no array
      const conteudo = dados
        .split("\r")
        .join("") // Substitui por vazio
        .split("\t") // Remove tabulações
        .join("") // Remove os caracteres de retorno de carro
        .split("\n")
        .filter((linha) => linha.trim() !== ""); // Remove linhas vazias

      // Retorna o conteúdo como um objeto JSON
      return res.status(200).json({ conteudo });
    } else {
      return res.status(400).json({ erro: "Parâmetro 'nome' é necessário." });
    }
  } catch (erro) {
    if (erro.code === "ENOENT") {
      res.status(404).json({ erro: "Arquivo não encontrado" });
    } else if (erro.code === "EACCES") {
      res
        .status(403)
        .json({ erro: "Permissão negada ao tentar acessar o arquivo" });
    } else {
      console.error("Erro ao ler o arquivo:", erro.message);
      res
        .status(500)
        .json({ erro: "Erro ao ler o arquivo", detalhes: erro.message });
    }
  }
});

servidor.put("/arquivo/:nome", async (req, res) => {
  try {
    const { nome } = req.params;
    const { conteudo } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: "Nome inválido." });
    }
    if (!conteudo || typeof conteudo !== "string") {
      return res.status(400).json({ erro: "Conteúdo inválido." });
    }

    const nomeArquivo = path.basename(nome);
    const caminhoArquivo = path.join(__dirname, "textos", nomeArquivo + ".txt");

    let dadosExistentes = "";
    try {
      dadosExistentes = await fsp.readFile(caminhoArquivo, "utf8");
    } catch (erro) {
      if (erro.code !== "ENOENT") throw erro;
    }

    await fsp.writeFile(caminhoArquivo, `${dadosExistentes}\n${conteudo}`);

    res.json({ mensagem: "Conteúdo adicionado com sucesso." });
  } catch (erro) {
    handleFileError(res, erro);
  }
});

servidor.post("/arquivo", async (req, res) => {
  try {
    const { nome, conteudo } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome do arquivo é necessário." });
    }
    if (!conteudo) {
      return res.status(400).json({ message: "Conteúdo não encontrado" });
    }

    const nomeArquivo = path.basename(nome);
    const caminhoDiretorio = path.join(__dirname, "textos");
    const caminhoArquivo = path.join(caminhoDiretorio, nomeArquivo + ".txt");

    await fsp.mkdir(caminhoDiretorio, { recursive: true });
    await fsp.writeFile(caminhoArquivo, conteudo);

    return res.status(201).json({ mensagem: "Arquivo salvo com sucesso." });
  } catch (error) {
    handleFileError(res, error);
  }
});

servidor.delete("/arquivo/:nome", async (req, res) => {
  try {
    const { nome } = req.params;

    if (!nome) {
      return res.status(400).json({ message: "Nome do arquivo é necessário." });
    }

    const nomeArquivo = path.basename(nome);
    const caminhoArquivo = path.join(__dirname, "textos", nomeArquivo + ".txt");

    await fsp.rm(caminhoArquivo);
    return res.status(200).json({ message: "Arquivo removido com sucesso." });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ message: "Arquivo não encontrado." });
    }
    handleFileError(res, error);
  }
});

function handleFileError(res, erro) {
  if (erro.code === "ENOENT") {
    res.status(404).json({ erro: "Arquivo não encontrado" });
  } else if (erro.code === "EACCES") {
    res.status(403).json({ erro: "Permissão negada" });
  } else {
    console.error("Erro:", erro.message);
    res.status(500).json({ erro: "Erro interno", detalhes: erro.message });
  }
}

servidor.listen(3000, () => console.log("Servidor está rodando... 🔥"));
