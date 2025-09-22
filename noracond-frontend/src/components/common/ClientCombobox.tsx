import React, { useState, useEffect, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { Client } from '../../types/client';
import clientService from '../../services/clientService';

interface ClientComboboxProps {
  value: string;
  onChange: (clientId: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const ClientCombobox: React.FC<ClientComboboxProps> = ({
  value,
  onChange,
  placeholder = "Selecione um cliente...",
  error,
  disabled = false,
  className = ""
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Carregar clientes iniciais
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const response = await clientService.getClients({ page: 1, pageSize: 100 });
        setClients(response.data);
        setFilteredClients(response.data);
        
        // Se há um valor selecionado, encontrar o cliente correspondente
        if (value) {
          const client = response.data.find(c => c.id === value);
          setSelectedClient(client || null);
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [value]);

  // Filtrar clientes baseado na busca
  useEffect(() => {
    if (query === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter((client) =>
        client.nome.toLowerCase().includes(query.toLowerCase()) ||
        client.cpfCnpj.includes(query) ||
        client.email.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [query, clients]);

  const handleChange = (client: Client | null) => {
    setSelectedClient(client);
    onChange(client?.id || '');
  };

  const displayValue = (client: Client | null) => {
    if (!client) return '';
    return `${client.nome} - ${client.cpfCnpj}`;
  };

  return (
    <div className={className}>
      <Combobox value={selectedClient} onChange={handleChange} disabled={disabled}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className={`w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 ${
                error ? 'border-red-300' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              displayValue={displayValue}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {loading ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Carregando clientes...
                </div>
              ) : filteredClients.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nenhum cliente encontrado.
                </div>
              ) : (
                filteredClients.map((client) => (
                  <Combobox.Option
                    key={client.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-teal-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={client}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{client.nome}</span>
                            <span className="text-sm text-gray-500">
                              {client.cpfCnpj} • {client.email}
                            </span>
                          </div>
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-teal-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ClientCombobox;