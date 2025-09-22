import React, { useState, useEffect, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { Process } from '../../types/process';
import { processService } from '../../services/processService';

interface ProcessComboboxProps {
  value: string;
  onChange: (processId: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const ProcessCombobox: React.FC<ProcessComboboxProps> = ({
  value,
  onChange,
  placeholder = "Selecione um processo...",
  error,
  disabled = false,
  className = ""
}) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);

  // Carregar processos iniciais
  useEffect(() => {
    const loadProcesses = async () => {
      try {
        setLoading(true);
        const response = await processService.getProcesses({ page: 1, pageSize: 100 });
        setProcesses(response.data);
        setFilteredProcesses(response.data);
        
        // Se há um valor selecionado, encontrar o processo correspondente
        if (value) {
          const process = response.data.find(p => p.id === value);
          setSelectedProcess(process || null);
        }
      } catch (error) {
        console.error('Erro ao carregar processos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProcesses();
  }, [value]);

  // Filtrar processos baseado na busca
  useEffect(() => {
    if (query === '') {
      setFilteredProcesses(processes);
    } else {
      const filtered = processes.filter((process) =>
        process.numeroProcesso.toLowerCase().includes(query.toLowerCase()) ||
        process.titulo.toLowerCase().includes(query.toLowerCase()) ||
        process.clienteNome.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProcesses(filtered);
    }
  }, [query, processes]);

  const handleChange = (process: Process | null) => {
    setSelectedProcess(process);
    onChange(process?.id || '');
  };

  const displayValue = (process: Process | null) => {
    if (!process) return '';
    return `${process.numeroProcesso} - ${process.titulo}`;
  };

  return (
    <div className={className}>
      <Combobox value={selectedProcess} onChange={handleChange} disabled={disabled}>
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
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
              {loading ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Carregando processos...
                </div>
              ) : filteredProcesses.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nenhum processo encontrado.
                </div>
              ) : (
                filteredProcesses.map((process) => (
                  <Combobox.Option
                    key={process.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-teal-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={process}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="block">
                          <div className={`truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {process.numeroProcesso} - {process.titulo}
                          </div>
                          <div className={`text-sm ${active ? 'text-teal-200' : 'text-gray-500'}`}>
                            Cliente: {process.clienteNome}
                          </div>
                        </div>
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
    </div>
  );
};