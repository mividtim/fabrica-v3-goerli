import { Bytes } from '@graphprotocol/graph-ts'
import {
  Transfer,
  Token,
  User
} from '../generated/schema'
import {
  Token as TokenContract,
  TransferBatch as TransferBatchEvent,
  TransferSingle as TransferSingleEvent,
  UpdateConfiguration as UpdateConfigurationEvent,
  UpdateOperatingAgreement as UpdateOperatingAgreementEvent,
  UpdateValidator as UpdateValidatorEvent,
  URI as UriEvent,
} from '../generated/Token/Token'

export function handleTransferBatch(event: TransferBatchEvent): void {
  for (let i = 0 ; i < event.params.ids.length ; i++) {
    const transfer = new Transfer(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    const tokenIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.ids[i]))
    transfer.operator = event.params.operator
    transfer.from = event.params.from
    transfer.to = event.params.to
    transfer.token = tokenIdBytes
    transfer.blockNumber = event.block.number
    transfer.blockTimestamp = event.block.timestamp
    transfer.transactionHash = event.transaction.hash
    transfer.save()
    const tokenContract = TokenContract.bind(event.address)
    const properties = tokenContract._property(event.params.ids[i])
    let token = Token.load(tokenIdBytes)
    if (token == null) {
      token = new Token(tokenIdBytes)
      token.creator = event.params.to
      token.definition = properties.getDefinition()
      token.tokenId = event.params.ids[i]
      token.totalSupply = event.params.values[i]
    }
    token.configuration = properties.getConfiguration()
    token.operatingAgreement = properties.getOperatingAgreement()
    token.validator = properties.getValidator()
    token.owner = event.params.to
    token.uri = tokenContract.uri(event.params.ids[i])
    token.save()
    let user = User.load(event.params.to)
    if (user == null) {
      user = new User(event.params.to)
      user.save()
    }
  }
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  const transfer = new Transfer(
      event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  const tokenIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.id))
  transfer.operator = event.params.operator
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.token = tokenIdBytes
  transfer.blockNumber = event.block.number
  transfer.blockTimestamp = event.block.timestamp
  transfer.transactionHash = event.transaction.hash
  transfer.save()
  const tokenContract = TokenContract.bind(event.address)
  const properties = tokenContract._property(event.params.id)
  let token = Token.load(tokenIdBytes)
  if (token == null) {
    token = new Token(tokenIdBytes)
    token.creator = event.params.to
    token.definition = properties.getDefinition()
    token.tokenId = event.params.id
    token.totalSupply = event.params.value
  }
  token.configuration = properties.getConfiguration()
  token.operatingAgreement = properties.getOperatingAgreement()
  token.validator = properties.getValidator()
  token.owner = event.params.to
  token.uri = tokenContract.uri(event.params.id)
  token.save()
  let user = User.load(event.params.to)
  if (user == null) {
    user = new User(event.params.to)
    user.save()
  }
}

export function handleUriChanged(event: UriEvent): void {
  const tokenIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.id))
  const token = Token.load(tokenIdBytes)
  if (token == null) {
    throw new Error(`Unknown token ${tokenIdBytes}`)
  }
  token.uri = event.params.value
  token.save()
}

export function handleUpdateConfiguration(event: UpdateConfigurationEvent): void {
  const tokenIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.param0))
  const token = Token.load(tokenIdBytes)
  if (token == null) {
    throw new Error(`Unknown token ${tokenIdBytes}`)
  }
  token.configuration = event.params.newData
  token.save()
}

export function handleUpdateOperatingAgreement(event: UpdateOperatingAgreementEvent): void {
  const tokenIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.param0))
  const token = Token.load(tokenIdBytes)
  if (token == null) {
    throw new Error(`Unknown token ${tokenIdBytes}`)
  }
  token.operatingAgreement = event.params.newData
  token.save()
}

export function handleUpdateValidator(event: UpdateValidatorEvent): void {
  const tokenIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.tokenId))
  const token = Token.load(tokenIdBytes)
  if (token == null) {
    throw new Error(`Unknown token ${tokenIdBytes}`)
  }
  token.validator = event.params.validator
  token.save()
}
