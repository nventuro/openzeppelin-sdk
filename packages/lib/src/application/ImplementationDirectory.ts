import Logger from '../utils/Logger';
import { sendTransaction, deploy } from '../utils/Transactions';
import Contracts from '../artifacts/Contracts';
import ZosContract from '../artifacts/ZosContract';

const log = new Logger('ImplementationDirectory');

// TS-TODO: review which members could be private
export default class ImplementationDirectory {

  public directoryContract: ZosContract;
  public txParams: any;

  public static async deploy(txParams: any = {}): Promise<ImplementationDirectory> {
    const contract = this.getContract();
    log.info(`Deploying new ${contract.schema.contractName}...`);
    const directory = await deploy(contract, [], txParams);
    log.info(`Deployed ${contract.schema.contractName} at ${directory.address}`);
    return new this(directory, txParams);
  }

  public static fetch(address: string, txParams: any = {}): ImplementationDirectory {
    const contract = this.getContract();
    const directory = contract.at(address);
    return new this(directory, txParams);
  }

  public static getContract(): ZosContract {
    return Contracts.getFromLib('ImplementationDirectory');
  }

  constructor(directory: ZosContract, txParams: any = {}) {
    this.directoryContract = directory;
    this.txParams = txParams;
  }

  get contract(): ZosContract {
    return this.directoryContract;
  }

  get address(): string {
    return this.directoryContract.address;
  }

  public async owner(): Promise<string> {
    return this.directoryContract.methods.owner().call({ ...this.txParams });
  }

  public async getImplementation(contractName: string): Promise<string | never> {
    if (!contractName) throw Error('Contract name is required to retrieve an implementation');
    return await this.directoryContract.methods.getImplementation(contractName).call({ ...this.txParams });
  }

  public async setImplementation(contractName: string, implementationAddress: string): Promise<any> {
    log.info(`Setting ${contractName} implementation ${implementationAddress}...`);
    await sendTransaction(this.directoryContract.methods.setImplementation, [contractName, implementationAddress], { ...this.txParams });
    log.info(`Implementation set: ${implementationAddress}`);
  }

  public async unsetImplementation(contractName: string): Promise<any> {
    log.info(`Unsetting ${contractName} implementation...`);
    await sendTransaction(this.directoryContract.methods.unsetImplementation, [contractName], { ...this.txParams });
    log.info(`${contractName} implementation unset`);
  }

  public async freeze(): Promise<any> {
    log.info('Freezing implementation directory...');
    await sendTransaction(this.directoryContract.methods.freeze, [], { ...this.txParams });
    log.info('Frozen');
  }

  public async isFrozen(): Promise<boolean> {
    return await this.directoryContract.methods.frozen().call();
  }
}