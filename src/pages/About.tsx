import React from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';

const aboutBreadcrumbTrail = [{ label: 'О программе' }];

const About: React.FC = () => (
  <AppLayout breadcrumbTrail={aboutBreadcrumbTrail}>
    <h1 style={{ marginTop: 0 }}>О программе</h1>
    <section className="mb-4">
      <p className="text-color-secondary mb-2">
        Дизайн-система <strong>Venom UI</strong> — переносимый кит компонентов и стилей для единообразного интерфейса приложений.
      </p>
      <p className="text-color-secondary mb-2">
        Витрина компонентов доступна на главной странице: кнопки, поля ввода, таблицы, бейджи статусов, модальные окна, степпер, уведомления и другие элементы.
      </p>
      <p>
        <Link to="/" className="p-button p-button-sm p-button-outlined">
          <i className="pi pi-th-large mr-2" />
          Перейти к витрине компонентов
        </Link>
      </p>
    </section>
  </AppLayout>
);

export default About;
