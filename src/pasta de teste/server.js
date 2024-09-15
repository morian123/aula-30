/* const fs = require('fs');
const path = require('path');

app.post('/create-file', (req, res) => {
  const { nome } = req.body;
  
  if (!nome) {
    return res.status(404).json({ erro: "Nome no body é necessário." });
  }

  // Conteúdo que será escrito no arquivo
  const conteudo = req.body.conteudo;

  if (!conteudo) {
    return res.status(400).json({ erro: "Conteúdo no body é necessário." });
  }

  // Definindo o caminho da pasta onde o arquivo será criado
  const pastaDestino = path.join(__dirname, 'arquivos');

  // Verifica se a pasta existe, caso contrário, cria a pasta
  if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino);
  }

  // Definindo o caminho completo do arquivo
  const caminhoArquivo = path.join(pastaDestino, `${nome}.txt`);

  // Escrevendo o conteúdo no arquivo
  fs.writeFile(caminhoArquivo, conteudo, (err) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao criar o arquivo." });
    }

    return res.status(200).json({ mensagem: "Arquivo criado com sucesso.", caminho: caminhoArquivo });
  });
}); */