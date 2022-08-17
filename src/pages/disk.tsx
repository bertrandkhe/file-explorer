import { ServerResponse } from 'http';
import { GetServerSideProps } from 'next';
import React from 'react';
import { URLSearchParams } from 'url';
import fs from 'fs';
import path from 'path';
import { root } from '../server/config/disk';

const Disk: React.FC = () => {
  return null;
}

export default Disk;

const routes = {
  async download(input: {
    key: string,
  }, res: ServerResponse) {
    const filepath = path.resolve(root, input.key);
    const readStream = fs.createReadStream(filepath);
    return new Promise<void>((resolve) => {
      readStream.pipe(res);
      readStream.on('end', () => {
        res.end();
        resolve();
      });
    });
  }
};

type Routes = typeof routes;
type Actions = keyof Routes;

const validActions = Object.keys(routes);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;
  const reqUrl = req.url as string;
  const search = reqUrl.includes('?') ? reqUrl.split('?').pop() as string : '';
  const searchParams = new URLSearchParams(search);
  const rawAction = searchParams.get('action') || '';
  if (!validActions.includes(rawAction)) {
    res.writeHead(400);
    res.write(JSON.stringify({
      'errors': [{
        'code': 'INVALID_ACTION',
      }], 
    }));
    res.end();
    return {
      props: {},
    };
  }
  const action = rawAction as Actions;
  const input = JSON.parse(searchParams.get('input') ?? '""');
  try {
    await routes[action](input, res);
  } catch (err) {
    res.writeHead(400);
    res.write(JSON.stringify({
      'errors': [{
        'code': ',
      }], 
    }));
    res.end();
  }
  return {
    props: {},
  };
}