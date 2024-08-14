local json = require('json')

EncryptionPublicKey = EncryptionPublicKey or ''
Messages = Messages or {}

Handlers.add(
  "setEncryptionPublicKey",
  Handlers.utils.hasMatchingTag("Action", "Set-Encryption-Public-Key"),
  function(msg)
    assert(
      msg.From == ao.env.Process.Owner,
      "This action is only available to the process Owner"
    )
    EncryptionPublicKey = msg.Data
    ao.send({ Target = msg.From, Data = EncryptionPublicKey })
  end
)

Handlers.add(
  "getEncryptionPublicKey",
  Handlers.utils.hasMatchingTag("Action", "Get-Encryption-Public-Key"),
  function(msg)
    ao.send({ Target = msg.From, Data = EncryptionPublicKey })
  end
)

Handlers.add(
  "sendEncryptedMessage",
  Handlers.utils.hasMatchingTag("Action", "Send-Encrypted-Message"),
  function(msg)
    local decoded = json.decode(msg.Data)
    local message = decoded.message
    local nonce = decoded.nonce
    local publicKey = decoded.nonce
    table.insert(Messages, msg.Data)
    ao.send({ Target = msg.From, Data = 'OK' })
  end
)

Handlers.add(
  "getEncryptedMessages",
  Handlers.utils.hasMatchingTag("Action", "Get-Encrypted-Messages"),
  function(msg)
    ao.send({ Target = msg.From, Data = json.encode(Messages) })
  end
)
