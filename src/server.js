const express = require("express");
const fsp = require("fs/promises");
const path = require("path");

const caminhoArquivo = path.join(__dirname, "dados.txt");
const servidor = express();

servidor.use(express.json());

servidor.get("/dados", async (_req, res) => {
  try {
    let dados = await fsp.readFile(caminhoArquivo, "utf8");

    dados = dados
      .split("\r")
      .join("")
      .split("\n")
      .filter((linha) => linha.trim() !== "");

    res.status(200).json({ conteudo: dados });
  } catch (erro) {
    if (erro.code === "ENOENT") {
      // Arquivo não encontrado
      res.status(404).json({ erro: "Arquivo não encontrado" });
    } else if (erro.code === "EACCES") {
      // Permissão negada
      res.status(403).json({ erro: "Permissão negada ao tentar acessar o arquivo" });
    } else {
      // Outros erros
      console.error("Erro ao ler o arquivo:", erro.message);
      res
        .status(500)
        .json({ erro: "Erro ao ler o arquivo", detalhes: erro.message });
    }
  }
});

servidor.put("/dados", async (req, res) => {
  try {
    let { conteudo } = req.body;
    if (!conteudo || typeof conteudo !== "string" || conteudo.trim() === "") {
      return res.status(400).json({ erro: "Conteúdo inválido: deve ser uma string não vazia." });
    }

    let dadosExistentes;
    try {
      dadosExistentes = await fsp.readFile(caminhoArquivo, "utf8");
    } catch (erro) {
      if (erro.code === "ENOENT") {
        // Arquivo não existe; cria o arquivo
        await fsp.writeFile(caminhoArquivo, conteudo);
        return res.status(201).json({ mensagem: "Arquivo criado com sucesso." });
      } else {
        throw erro;
      }
    }

    // Adiciona o novo conteúdo ao final do arquivo
    await fsp.writeFile(caminhoArquivo, `${dadosExistentes}\n${conteudo}`);

    res.json({ mensagem: "Conteúdo adicionado com sucesso." });
  } catch (erro) {
    if (erro.code === "EACCES") {
      // Permissão negada
      res.status(403).json({ erro: "Permissão negada ao tentar escrever no arquivo" });
    } else {
      console.error("Erro ao escrever no arquivo:", erro.message);
      res
        .status(500)
        .json({ erro: "Erro ao processar o arquivo", detalhes: erro.message });
    }
  }
});

servidor.listen(3000, () => console.log("Servidor está rodando... 🔥"));
