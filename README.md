# notification-messaging-system
plicação prática em Node.js que utiliza os conceitos de Arquitetura Orientada a Eventos e Concorrência.Simples sistema de notificação que processa e envia mensagens de forma assíncrona

# Estrutura da Aplicação
* Emissão de Eventos: A aplicação emitirá um evento sempre que uma nova mensagem for adicionada.
* Listeners para Eventos: Listeners responderão a esses eventos processando e enviando as mensagens.
* Concorrência: As mensagens serão processadas de forma assíncrona, simulando uma operação de envio de mensagem que demora alguns segundos.
