import LogSnag from 'logsnag';

export const logsnag = new LogSnag({
  token:
    process.env.NODE_ENV === 'production'
      ? '0ba358138fac0bf788addd5a63620391'
      : '',
  project: 'freedom-fatigues',
});
