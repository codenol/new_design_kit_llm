import React from 'react';
import { useParams } from 'react-router-dom';

const MonitoringSetup: React.FC = () => {
  const { id } = useParams();
  return (
    <div>
      <h1>Настройка мониторинга</h1>
      <p>Страница настройки мониторинга для элемента с ID: {id}</p>
    </div>
  );
};

export default MonitoringSetup;
