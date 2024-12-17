// @generated by protobuf-ts 2.9.1 with parameter generate_dependencies
// @generated from protobuf file "massa/model/v1/stats.proto" (package "massa.model.v1", syntax proto3)
// tslint:disable
//
// Copyright (c) 2023 MASSA LABS <info@massa.net>
//
import type { BinaryWriteOptions } from '@protobuf-ts/runtime';
import type { IBinaryWriter } from '@protobuf-ts/runtime';
import { WireType } from '@protobuf-ts/runtime';
import type { BinaryReadOptions } from '@protobuf-ts/runtime';
import type { IBinaryReader } from '@protobuf-ts/runtime';
import { UnknownFieldHandler } from '@protobuf-ts/runtime';
import type { PartialMessage } from '@protobuf-ts/runtime';
import { reflectionMergePartial } from '@protobuf-ts/runtime';
import { MESSAGE_TYPE } from '@protobuf-ts/runtime';
import { MessageType } from '@protobuf-ts/runtime';
import { NativeTime } from './time';
/**
 * Consensus statistics
 *
 * @generated from protobuf message massa.model.v1.ConsensusStats
 */
export interface ConsensusStats {
  /**
   * Start of the time span for stats
   *
   * @generated from protobuf field: massa.model.v1.NativeTime start_timespan = 1;
   */
  startTimespan?: NativeTime;
  /**
   * End of the time span for stats
   *
   * @generated from protobuf field: massa.model.v1.NativeTime end_timespan = 2;
   */
  endTimespan?: NativeTime;
  /**
   * Number of final blocks
   *
   * @generated from protobuf field: uint64 final_block_count = 3;
   */
  finalBlockCount: bigint;
  /**
   * Number of stale blocks in memory
   *
   * @generated from protobuf field: uint64 stale_block_count = 4;
   */
  staleBlockCount: bigint;
  /**
   * Number of actives cliques
   *
   * @generated from protobuf field: uint64 clique_count = 5;
   */
  cliqueCount: bigint;
}
/**
 * Pool statistics
 *
 * @generated from protobuf message massa.model.v1.PoolStats
 */
export interface PoolStats {
  /**
   * Endorsements
   *
   * @generated from protobuf field: uint64 endorsements_count = 1;
   */
  endorsementsCount: bigint;
  /**
   * Operations
   *
   * @generated from protobuf field: uint64 operations_count = 2;
   */
  operationsCount: bigint;
}
/**
 * Network statistics
 *
 * @generated from protobuf message massa.model.v1.NetworkStats
 */
export interface NetworkStats {
  /**
   * In connections count
   *
   * @generated from protobuf field: uint64 in_connection_count = 1;
   */
  inConnectionCount: bigint;
  /**
   * Out connections count
   *
   * @generated from protobuf field: uint64 out_connection_count = 2;
   */
  outConnectionCount: bigint;
  /**
   * Total known peers count
   *
   * @generated from protobuf field: uint64 known_peer_count = 3;
   */
  knownPeerCount: bigint;
  /**
   * Banned node count
   *
   * @generated from protobuf field: uint64 banned_peer_count = 4;
   */
  bannedPeerCount: bigint;
  /**
   * Active node count
   *
   * @generated from protobuf field: uint64 active_node_count = 5;
   */
  activeNodeCount: bigint;
}
/**
 * Execution statistics
 *
 * @generated from protobuf message massa.model.v1.ExecutionStats
 */
export interface ExecutionStats {
  /**
   * Time window start
   *
   * @generated from protobuf field: massa.model.v1.NativeTime time_window_start = 1;
   */
  timeWindowStart?: NativeTime;
  /**
   * Time window end
   *
   * @generated from protobuf field: massa.model.v1.NativeTime time_window_end = 2;
   */
  timeWindowEnd?: NativeTime;
  /**
   * Number of final blocks in the time window
   *
   * @generated from protobuf field: uint64 final_block_count = 3;
   */
  finalBlockCount: bigint;
  /**
   * Number of final executed operations in the time window
   *
   * @generated from protobuf field: uint64 final_executed_operations_count = 4;
   */
  finalExecutedOperationsCount: bigint;
}
// @generated message type with reflection information, may provide speed optimized methods
class ConsensusStats$Type extends MessageType<ConsensusStats> {
  constructor() {
    super('massa.model.v1.ConsensusStats', [
      { no: 1, name: 'start_timespan', kind: 'message', T: () => NativeTime },
      { no: 2, name: 'end_timespan', kind: 'message', T: () => NativeTime },
      {
        no: 3,
        name: 'final_block_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
      {
        no: 4,
        name: 'stale_block_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
      {
        no: 5,
        name: 'clique_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
    ]);
  }
  create(value?: PartialMessage<ConsensusStats>): ConsensusStats {
    const message = {
      finalBlockCount: 0n,
      staleBlockCount: 0n,
      cliqueCount: 0n,
    };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, {
      enumerable: false,
      value: this,
    });
    if (value !== undefined)
      reflectionMergePartial<ConsensusStats>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: ConsensusStats,
  ): ConsensusStats {
    let message = target ?? this.create();
    let end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* massa.model.v1.NativeTime start_timespan */ 1:
          message.startTimespan = NativeTime.internalBinaryRead(
            reader,
            reader.uint32(),
            options,
            message.startTimespan,
          );
          break;
        case /* massa.model.v1.NativeTime end_timespan */ 2:
          message.endTimespan = NativeTime.internalBinaryRead(
            reader,
            reader.uint32(),
            options,
            message.endTimespan,
          );
          break;
        case /* uint64 final_block_count */ 3:
          message.finalBlockCount = reader.uint64().toBigInt();
          break;
        case /* uint64 stale_block_count */ 4:
          message.staleBlockCount = reader.uint64().toBigInt();
          break;
        case /* uint64 clique_count */ 5:
          message.cliqueCount = reader.uint64().toBigInt();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: ConsensusStats,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* massa.model.v1.NativeTime start_timespan = 1; */
    if (message.startTimespan)
      NativeTime.internalBinaryWrite(
        message.startTimespan,
        writer.tag(1, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* massa.model.v1.NativeTime end_timespan = 2; */
    if (message.endTimespan)
      NativeTime.internalBinaryWrite(
        message.endTimespan,
        writer.tag(2, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* uint64 final_block_count = 3; */
    if (message.finalBlockCount !== 0n)
      writer.tag(3, WireType.Varint).uint64(message.finalBlockCount);
    /* uint64 stale_block_count = 4; */
    if (message.staleBlockCount !== 0n)
      writer.tag(4, WireType.Varint).uint64(message.staleBlockCount);
    /* uint64 clique_count = 5; */
    if (message.cliqueCount !== 0n)
      writer.tag(5, WireType.Varint).uint64(message.cliqueCount);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(
        this.typeName,
        message,
        writer,
      );
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message massa.model.v1.ConsensusStats
 */
export const ConsensusStats = new ConsensusStats$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PoolStats$Type extends MessageType<PoolStats> {
  constructor() {
    super('massa.model.v1.PoolStats', [
      {
        no: 1,
        name: 'endorsements_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
      {
        no: 2,
        name: 'operations_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
    ]);
  }
  create(value?: PartialMessage<PoolStats>): PoolStats {
    const message = { endorsementsCount: 0n, operationsCount: 0n };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, {
      enumerable: false,
      value: this,
    });
    if (value !== undefined)
      reflectionMergePartial<PoolStats>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: PoolStats,
  ): PoolStats {
    let message = target ?? this.create();
    let end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* uint64 endorsements_count */ 1:
          message.endorsementsCount = reader.uint64().toBigInt();
          break;
        case /* uint64 operations_count */ 2:
          message.operationsCount = reader.uint64().toBigInt();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: PoolStats,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* uint64 endorsements_count = 1; */
    if (message.endorsementsCount !== 0n)
      writer.tag(1, WireType.Varint).uint64(message.endorsementsCount);
    /* uint64 operations_count = 2; */
    if (message.operationsCount !== 0n)
      writer.tag(2, WireType.Varint).uint64(message.operationsCount);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(
        this.typeName,
        message,
        writer,
      );
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message massa.model.v1.PoolStats
 */
export const PoolStats = new PoolStats$Type();
// @generated message type with reflection information, may provide speed optimized methods
class NetworkStats$Type extends MessageType<NetworkStats> {
  constructor() {
    super('massa.model.v1.NetworkStats', [
      {
        no: 1,
        name: 'in_connection_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
      {
        no: 2,
        name: 'out_connection_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
      {
        no: 3,
        name: 'known_peer_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
      {
        no: 4,
        name: 'banned_peer_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
      {
        no: 5,
        name: 'active_node_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
    ]);
  }
  create(value?: PartialMessage<NetworkStats>): NetworkStats {
    const message = {
      inConnectionCount: 0n,
      outConnectionCount: 0n,
      knownPeerCount: 0n,
      bannedPeerCount: 0n,
      activeNodeCount: 0n,
    };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, {
      enumerable: false,
      value: this,
    });
    if (value !== undefined)
      reflectionMergePartial<NetworkStats>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: NetworkStats,
  ): NetworkStats {
    let message = target ?? this.create();
    let end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* uint64 in_connection_count */ 1:
          message.inConnectionCount = reader.uint64().toBigInt();
          break;
        case /* uint64 out_connection_count */ 2:
          message.outConnectionCount = reader.uint64().toBigInt();
          break;
        case /* uint64 known_peer_count */ 3:
          message.knownPeerCount = reader.uint64().toBigInt();
          break;
        case /* uint64 banned_peer_count */ 4:
          message.bannedPeerCount = reader.uint64().toBigInt();
          break;
        case /* uint64 active_node_count */ 5:
          message.activeNodeCount = reader.uint64().toBigInt();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: NetworkStats,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* uint64 in_connection_count = 1; */
    if (message.inConnectionCount !== 0n)
      writer.tag(1, WireType.Varint).uint64(message.inConnectionCount);
    /* uint64 out_connection_count = 2; */
    if (message.outConnectionCount !== 0n)
      writer.tag(2, WireType.Varint).uint64(message.outConnectionCount);
    /* uint64 known_peer_count = 3; */
    if (message.knownPeerCount !== 0n)
      writer.tag(3, WireType.Varint).uint64(message.knownPeerCount);
    /* uint64 banned_peer_count = 4; */
    if (message.bannedPeerCount !== 0n)
      writer.tag(4, WireType.Varint).uint64(message.bannedPeerCount);
    /* uint64 active_node_count = 5; */
    if (message.activeNodeCount !== 0n)
      writer.tag(5, WireType.Varint).uint64(message.activeNodeCount);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(
        this.typeName,
        message,
        writer,
      );
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message massa.model.v1.NetworkStats
 */
export const NetworkStats = new NetworkStats$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ExecutionStats$Type extends MessageType<ExecutionStats> {
  constructor() {
    super('massa.model.v1.ExecutionStats', [
      {
        no: 1,
        name: 'time_window_start',
        kind: 'message',
        T: () => NativeTime,
      },
      { no: 2, name: 'time_window_end', kind: 'message', T: () => NativeTime },
      {
        no: 3,
        name: 'final_block_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
      {
        no: 4,
        name: 'final_executed_operations_count',
        kind: 'scalar',
        T: 4 /* ScalarType.UINT64*/,
        L: 0 /* LongType.BIGINT*/,
      },
    ]);
  }
  create(value?: PartialMessage<ExecutionStats>): ExecutionStats {
    const message = { finalBlockCount: 0n, finalExecutedOperationsCount: 0n };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, {
      enumerable: false,
      value: this,
    });
    if (value !== undefined)
      reflectionMergePartial<ExecutionStats>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: ExecutionStats,
  ): ExecutionStats {
    let message = target ?? this.create();
    let end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* massa.model.v1.NativeTime time_window_start */ 1:
          message.timeWindowStart = NativeTime.internalBinaryRead(
            reader,
            reader.uint32(),
            options,
            message.timeWindowStart,
          );
          break;
        case /* massa.model.v1.NativeTime time_window_end */ 2:
          message.timeWindowEnd = NativeTime.internalBinaryRead(
            reader,
            reader.uint32(),
            options,
            message.timeWindowEnd,
          );
          break;
        case /* uint64 final_block_count */ 3:
          message.finalBlockCount = reader.uint64().toBigInt();
          break;
        case /* uint64 final_executed_operations_count */ 4:
          message.finalExecutedOperationsCount = reader.uint64().toBigInt();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: ExecutionStats,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* massa.model.v1.NativeTime time_window_start = 1; */
    if (message.timeWindowStart)
      NativeTime.internalBinaryWrite(
        message.timeWindowStart,
        writer.tag(1, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* massa.model.v1.NativeTime time_window_end = 2; */
    if (message.timeWindowEnd)
      NativeTime.internalBinaryWrite(
        message.timeWindowEnd,
        writer.tag(2, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* uint64 final_block_count = 3; */
    if (message.finalBlockCount !== 0n)
      writer.tag(3, WireType.Varint).uint64(message.finalBlockCount);
    /* uint64 final_executed_operations_count = 4; */
    if (message.finalExecutedOperationsCount !== 0n)
      writer
        .tag(4, WireType.Varint)
        .uint64(message.finalExecutedOperationsCount);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(
        this.typeName,
        message,
        writer,
      );
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message massa.model.v1.ExecutionStats
 */
export const ExecutionStats = new ExecutionStats$Type();
