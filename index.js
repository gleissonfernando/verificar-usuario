#!/usr/bin/env node

/**
 * Discord Verification Bot - Entry Point
 * 
 * Este arquivo inicia o servidor da aplicação.
 * Ele carrega as variáveis de ambiente e executa o servidor compilado.
 */

require('dotenv').config();

// Importar e executar o servidor compilado
require('./dist/index.js');
