const { readContractSafe } = require("./blockchainService");
const { GROUP_SAVE_FACTORY_ABI, GROUP_SAVE_ABI, ADDRESSES } = require("../config/contracts");

// In-memory registry for off-chain invitations and deep-links
const offChainInvites = new Map(); // circleAddress => Set of user addresses or invite codes

class CircleService {
  getFactoryAddress() {
    return ADDRESSES.groupSaveFactory;
  }

  async getCircleCount() {
    const factory = this.getFactoryAddress();
    if (!factory) return 0;
    const count = await readContractSafe({
      address: factory,
      abi: GROUP_SAVE_FACTORY_ABI,
      functionName: "circleCount",
    });
    return parseInt(count, 10);
  }

  async getCircles(offset = 0, limit = 10) {
    const factory = this.getFactoryAddress();
    if (!factory) return { circles: [], total: 0 };

    const total = await this.getCircleCount();
    if (total === 0 || offset >= total) {
      return { circles: [], total, offset, limit };
    }

    const addresses = await readContractSafe({
      address: factory,
      abi: GROUP_SAVE_FACTORY_ABI,
      functionName: "getCircles",
      args: [BigInt(offset), BigInt(limit)],
    });

    // Fetch brief info for each circle
    const circles = await Promise.all(
      addresses.map(async (circleAddr) => {
        try {
          const info = await this.getCircleInfo(circleAddr);
          return { address: circleAddr, ...info };
        } catch {
          return { address: circleAddr, error: "Unavailable" };
        }
      })
    );

    return { circles, total, offset, limit };
  }

  async getUserCircles(userAddress) {
    const factory = this.getFactoryAddress();
    if (!factory) return [];

    const circleAddresses = await readContractSafe({
      address: factory,
      abi: GROUP_SAVE_FACTORY_ABI,
      functionName: "getUserCircles",
      args: [userAddress],
    });

    return await Promise.all(
      circleAddresses.map(async (circleAddr) => {
        const [info, memberInfo] = await Promise.all([
          this.getCircleInfo(circleAddr),
          this.getMemberInfo(circleAddr, userAddress),
        ]);
        return {
          address: circleAddr,
          ...info,
          userStatus: memberInfo,
        };
      })
    );
  }

  async getCircleInfo(circleAddress) {
    return await readContractSafe({
      address: circleAddress,
      abi: GROUP_SAVE_ABI,
      functionName: "getInfo",
    });
  }

  async getMembers(circleAddress) {
    return await readContractSafe({
      address: circleAddress,
      abi: GROUP_SAVE_ABI,
      functionName: "getMembers",
    });
  }

  async getPayoutOrder(circleAddress) {
    return await readContractSafe({
      address: circleAddress,
      abi: GROUP_SAVE_ABI,
      functionName: "getPayoutOrder",
    });
  }

  async getMemberInfo(circleAddress, userAddress) {
    return await readContractSafe({
      address: circleAddress,
      abi: GROUP_SAVE_ABI,
      functionName: "getMemberInfo",
      args: [userAddress],
    });
  }

  async getAmountDue(circleAddress, userAddress) {
    return await readContractSafe({
      address: circleAddress,
      abi: GROUP_SAVE_ABI,
      functionName: "amountDue",
      args: [userAddress],
    });
  }

  async canResolve(circleAddress) {
    return await readContractSafe({
      address: circleAddress,
      abi: GROUP_SAVE_ABI,
      functionName: "canResolve",
    });
  }

  async previewSlot(circleAddress, round) {
    return await readContractSafe({
      address: circleAddress,
      abi: GROUP_SAVE_ABI,
      functionName: "previewSlot",
      args: [BigInt(round)],
    });
  }

  // Off-chain invite tracker
  recordInvite(circleAddress, invitee) {
    const normCircle = circleAddress.toLowerCase();
    const normInvitee = invitee.toLowerCase();
    if (!offChainInvites.has(normCircle)) {
      offChainInvites.set(normCircle, new Set());
    }
    offChainInvites.get(normCircle).add(normInvitee);
    return { circleAddress: normCircle, invitee: normInvitee, recordedAt: new Date().toISOString() };
  }

  getInvitesForCircle(circleAddress) {
    const list = offChainInvites.get(circleAddress.toLowerCase());
    return list ? Array.from(list) : [];
  }
}

module.exports = new CircleService();

