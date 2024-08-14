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

    assert(decoded.message, "Invalid message")
    assert(decoded.publicKey, "Invalid publicKey")
    assert(Messages[decoded.nonce] == nil, "Message ID (nonce) already used")

    Messages[decoded.nonce] = msg.Data

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
    ao.log('Data = ' .. msg.Data)
    local keys = json.decode(msg.Data)
    for k,v in pairs(keys) do
      ao.log(k.." = "..v)
      -- table.remove(Messages, v)
      if Messages[v] then Messages[v] = nil end
    end
    ao.send({ Target = msg.From, Data = msg.Data })
  end
)
