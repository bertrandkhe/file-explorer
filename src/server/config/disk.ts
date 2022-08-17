import env from '../env';

export const root = env.DISK_ROOT.endsWith('/') ? env.DISK_ROOT : `${env.DISK_ROOT}/`;