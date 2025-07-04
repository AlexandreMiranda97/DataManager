// frontend/src/App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Massa {
  id?: number;
  tipo: string;
  chave: string;
  valor: string;
}

export default function App() {
  const [massas, setMassas] = useState<Massa[]>([]);
  const [form, setForm] = useState<Massa>({ tipo: '', chave: '', valor: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchMassas = async () => {
    const res = await axios.get('http://localhost:3001/massas');
    setMassas(res.data);
  };

  useEffect(() => {
    fetchMassas();
  }, []);

  const handleSubmit = async () => {
    if (!form.tipo || !form.chave || !form.valor) return;
    try {
      if (editId !== null) {
        await axios.put(`http://localhost:3001/massas/${editId}`, {
          ...form,
          valor: JSON.parse(form.valor),
        });
      } else {
        await axios.post('http://localhost:3001/massas', {
          ...form,
          valor: JSON.parse(form.valor),
        });
      }
      setForm({ tipo: '', chave: '', valor: '' });
      setEditId(null);
      fetchMassas();
    } catch (err) {
      alert('Erro ao salvar massa. Verifique se o JSON está válido.');
    }
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`http://localhost:3001/massas/${id}`);
    fetchMassas();
  };

  const handleEdit = (massa: Massa) => {
    setEditId(massa.id!);
    setForm({ ...massa, valor: JSON.stringify(JSON.parse(massa.valor), null, 2) });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Tipo"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            />
            <Input
              placeholder="Chave"
              value={form.chave}
              onChange={(e) => setForm({ ...form, chave: e.target.value })}
            />
            <Button onClick={handleSubmit} className="w-full">
              {editId !== null ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
          <Textarea
            placeholder="Valor (formato JSON)"
            rows={5}
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
          />
        </CardContent>
      </Card>

      <div className="grid gap-2">
        {massas.map((massa) => (
          <Card key={massa.id} className="grid grid-cols-12 items-center px-4 py-2">
            <div className="col-span-2 font-medium">{massa.tipo}</div>
            <div className="col-span-3">{massa.chave}</div>
            <pre className="col-span-5 text-xs whitespace-pre-wrap">{massa.valor}</pre>
            <div className="col-span-2 flex gap-2 justify-end">
              <Button onClick={() => handleEdit(massa)} variant="secondary" size="sm">Editar</Button>
              <Button onClick={() => handleDelete(massa.id!)} variant="destructive" size="sm">Excluir</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
