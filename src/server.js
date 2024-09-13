const express = require("express");
const fsp = require("fs/promises");
const path = require("path");

const servidor = express();

servidor.use(express.json());

servidor.get("/arquivo", async (req, res) => {
  try {
    const { nome } = req.query;

    if (nome) {
      // Garante que o nome do arquivo seja seguro
      const nomeArquivo = path.basename(nome);
      const caminhoArquivo = path.join(__dirname, nomeArquivo + ".txt");

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
    const { nome } = req.params; // Corrigido para pegar 'nome' corretamente
    const { conteudo } = req.body;

    if (!nome) {
      return res
        .status(400)
        .json({ erro: "Nome inválido: deve ser uma string não vazia." });
    }

    if (!conteudo || typeof conteudo !== "string") {
      return res
        .status(400)
        .json({ erro: "Conteúdo inválido: deve ser uma string não vazia." });
    }

    const nomeArquivo = path.basename(nome);
    const caminhoArquivo = path.join(__dirname, "textos", nomeArquivo + ".txt"); // Define o caminho completo do arquivo

    let dadosExistentes;
    try {
      dadosExistentes = await fs.readFile(caminhoArquivo, "utf8");
    } catch (erro) {
      if (erro.code === "ENOENT") {
        // Arquivo não encontrado, inicializa com string vazia
        dadosExistentes = "";
      } else {
        throw erro; // Repassa outros erros
      }
    }

    // Adiciona o novo conteúdo ao final do arquivo
    await fs.writeFile(caminhoArquivo, `${dadosExistentes}\n${conteudo}`);

    res.json({ mensagem: "Conteúdo adicionado com sucesso." });
  } catch (erro) {
    if (erro.code === "EACCES") {
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

servidor.post("/arquivo", async (req, res) => {
  try {
    const { nome, conteudo } = req.body;

    if (!conteudo) {
      return res.status(404).json({ message: "Conteúdo não encontrado" });
    }

    if (nome) {
      const nomeArquivo = path.basename(nome);
      const caminhoDiretorio = path.join(__dirname, "textos");
      const caminhoArquivo = path.join(caminhoDiretorio, nomeArquivo + ".txt");

      // Cria o diretório se ele não existir
      await fsp.mkdir(caminhoDiretorio, { recursive: true });

      await fsp.writeFile(caminhoArquivo, conteudo); // Usando fsp.writeFile para escrita de arquivo com Promises

      return res.status(201).json({ mensagem: "Arquivo salvo com sucesso." });
    }

    return res.status(400).json({ message: "Nome do arquivo é necessário." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Algo deu errado", detalhes: error.message });
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

    // Tenta remover o arquivo
    await fsp.rm(caminhoArquivo);

    return res.status(200).json({ message: "Arquivo removido com sucesso." });
  } catch (error) {
    if (error.code === "ENOENT") {
      // Arquivo não encontrado
      return res.status(404).json({ message: "Arquivo não encontrado." });
    }
    
    res.status(500).json({ message: "Algo errado aconteceu", detalhes: error.message });
  }
});


servidor.listen(3000, () => console.log("Servidor está rodando... 🔥"));
