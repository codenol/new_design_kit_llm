import { useContext } from 'react';
import { BlockUIContext } from '../context/BlockUIContext';

export const useBlockUI = () => useContext(BlockUIContext);
