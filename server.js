import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());

app.post('/api/tiny-produtos', async (req, res) => {
  const token = process.env.TINY_API_TOKEN;
  const url = 'https://api.tiny.com.br/api2/produtos.pesquisa.php';

  if (!token) {
    return res.status(500).json({ erro: 'Token da API do Tiny não foi encontrado no arquivo .env' });
  }

  const params = new URLSearchParams();
  params.append('token', token);
  params.append('formato', 'JSON');
  
  console.log('------------------------------------');
  console.log('Nova requisição para o Tiny ERP...');

  try {
    const respostaTiny = await axios.post(url, params);

    // Linha Mágica: Imprime no terminal a resposta EXATA do Tiny
    console.log('Resposta completa do Tiny:', JSON.stringify(respostaTiny.data, null, 2));

    const retorno = respostaTiny.data.retorno;

    if (retorno.status === 'OK') {
      if (retorno.produtos && Array.isArray(retorno.produtos)) {
        console.log(`Sucesso! ${retorno.produtos.length} produtos encontrados.`);
        res.json(retorno.produtos);
      } else {
        console.log('Status OK, mas a lista de produtos veio vazia.');
        res.json([]);
      }
    } else {
      console.error('ERRO DETECTADO! A API do Tiny retornou um status de erro.');
      res.status(400).json({ erro: 'A API do Tiny retornou um erro.', detalhes: retorno.erros });
    }
  } catch (error) {
    console.error('FALHA GERAL! Não foi possível conectar com a API do Tiny.', error.message);
    res.status(500).json({ erro: 'Falha na comunicação com o servidor do Tiny.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});