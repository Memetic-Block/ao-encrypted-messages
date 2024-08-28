local json = require("json")

local function getTableKeys(tab)
  local keyset = {}
  for k,v in pairs(tab) do
    keyset[#keyset + 1] = k
  end
  table.sort(keyset)
  return keyset
end

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
    EncryptionPublicKey = msg.Tags.EncryptionPublicKey
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

    assert(type(decoded.message) == "string", "Invalid message")
    assert(type(decoded.publicKey) == "string", "Invalid publicKey")
    assert(
      type(decoded.recipientPublicKey) == "string",
      "Invalid recipientPublicKey"
    )
    assert(Messages[decoded.nonce] == nil, "Message ID (nonce) already used")

    Messages[decoded.nonce] = decoded.nonce

    ao.send({ Target = msg.From, Data = decoded.nonce })
  end
)

Handlers.add(
  "listEncryptedMessages",
  Handlers.utils.hasMatchingTag("Action", "List-Encrypted-Messages"),
  function(msg)
    ao.send({ Target = msg.From, Data = json.encode(getTableKeys(Messages)) })
  end
)

Handlers.add(
  "removeEncryptedMessages",
  Handlers.utils.hasMatchingTag("Action", "Remove-Encrypted-Messages"),
  function(msg)
    assert(
      msg.From == ao.env.Process.Owner,
      "This action is only available to the process Owner"
    )

    local keys = json.decode(msg.Data)
    for _,v in pairs(keys) do
      if Messages[v] then Messages[v] = nil end
    end

    ao.send({ Target = msg.From, Data = msg.Data })
  end
)
