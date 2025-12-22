import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid
} from '@mui/material';

// Interfaces para tipagem dos dados
interface Client {
  id: number;
  fullName: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface ServiceOrder {
  id: number;
  clientId: number;
  clientName: string;
  productId: number;
  productName: string;
  serviceType: string;
  description: string;
  price: number;
  status: string;
  createdAt: string;
  deliveryDate: string;
}

const ServiceOrders = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Estados do Formulário
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [serviceType, setServiceType] = useState('Montagem');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Carregar dados ao iniciar a tela
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, clientsRes, productsRes] = await Promise.all([
        api.get('/serviceorders'),
        api.get('/clients'),
        api.get('/products')
      ]);
      setServiceOrders(ordersRes.data);
      setClients(clientsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados. Verifique se o backend está rodando.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId || !selectedProductId || !price || !deliveryDate) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const newOrder = {
      clientId: Number(selectedClientId),
      productId: Number(selectedProductId),
      serviceType,
      description,
      price: Number(price),
      deliveryDate: new Date(deliveryDate).toISOString()
    };

    try {
      await api.post('/serviceorders', newOrder);
      alert("Ordem de Serviço criada com sucesso!");
      
      // Limpar formulário
      setDescription('');
      setPrice('');
      setDeliveryDate('');
      loadData(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao criar OS:", error);
      alert("Erro ao criar a Ordem de Serviço.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ordens de Serviço
      </Typography>

      {/* Formulário de Nova OS */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Nova Ordem de Serviço</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Seleção de Cliente */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={selectedClientId}
                  label="Cliente"
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  {clients.map(client => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Seleção de Produto (Armação/Lente) */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Produto</InputLabel>
                <Select
                  value={selectedProductId}
                  label="Produto"
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    // Preenche o preço automaticamente ao selecionar produto
                    const prod = products.find(p => p.id === Number(e.target.value));
                    if (prod) setPrice(prod.price.toString());
                  }}
                >
                  {products.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - R$ {product.price}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tipo de Serviço */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Serviço</InputLabel>
                <Select
                  value={serviceType}
                  label="Tipo de Serviço"
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <MenuItem value="Montagem">Montagem</MenuItem>
                  <MenuItem value="Manutencao">Manutenção</MenuItem>
                  <MenuItem value="Conserto">Conserto</MenuItem>
                  <MenuItem value="ExameVista">Exame de Vista</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Preço (R$)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Data de Entrega"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição / Observações"
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Salvar Ordem de Serviço
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Lista de Ordens de Serviço */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Serviço</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Entrega</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {serviceOrders.map((os) => (
              <TableRow key={os.id}>
                <TableCell>{os.id}</TableCell>
                <TableCell>{os.clientName}</TableCell>
                <TableCell>{os.productName}</TableCell>
                <TableCell>{os.serviceType}</TableCell>
                <TableCell>{os.status}</TableCell>
                <TableCell>R$ {os.price.toFixed(2)}</TableCell>
                <TableCell>{new Date(os.deliveryDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ServiceOrders;