import React from 'react';
import { Paginator, PaginatorProps } from 'primereact/paginator';
import './paginator.scss';

interface CustomPaginatorProps extends PaginatorProps {}

const CustomPaginator: React.FC<CustomPaginatorProps> = (props) => <Paginator {...props} />;

export default CustomPaginator;
