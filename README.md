# notification-messaging-system
plicação prática em Node.js que utiliza os conceitos de Arquitetura Orientada a Eventos e Concorrência.Simples sistema de notificação que processa e envia mensagens de forma assíncrona

# Estrutura da Aplicação
* Emissão de Eventos: A aplicação emitirá um evento sempre que uma nova mensagem for adicionada.
* Listeners para Eventos: Listeners responderão a esses eventos processando e enviando as mensagens.
* Concorrência: As mensagens serão processadas de forma assíncrona, simulando uma operação de envio de mensagem que demora alguns segundos.

# Pontos adicionais
a aplicação para simular um chat de múltiplos usuários com persistência das mensagens em um array. A aplicação terá as seguintes funcionalidades:

* Persistência das Mensagens: As mensagens serão armazenadas em um array no backend.
* Múltiplos Usuários: Simulação de chat onde usuários podem enviar mensagens individuais ou coletivas.
* Notificações de Nova Mensagem: No frontend, haverá ícones de notificação para novas mensagens não lidas.
* Status da Mensagem: As mensagens terão status de leitura (lida/não lida) e recebimento (enviada/recebida).
* Mensagens Individuais ou Coletivas: As mensagens podem ser enviadas individualmente para um usuário ou coletivamente para todos