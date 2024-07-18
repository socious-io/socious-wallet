import styles from './index.module.scss';

function Download() {
  return (
    <div className={styles['download']}>
      <div className={styles['title']}>
        <h5 className={styles['h5']}>Self-Sovereign Identity (SSI) Wallet</h5>
        <h1 className={styles['h1']}>Socious Identity Wallet</h1>
      </div>
      <div className={styles['cta']}>
        <h4 className={styles['h4']}>Download now</h4>
        <div className={styles['buttons']}>
          <a href="https://wallet.socious.io/android" target="_blank" rel="noreferrer">
            <img
              src="https://cdn.prod.website-files.com/641bae61d957fd6fba23ae35/64223647a6067b098c88396b_Google%20Store%20Badge.webp"
              loading="lazy"
              height="44"
              width="132"
              alt="Download Socious on the Play Store"
            ></img>
          </a>
          <a href="https://wallet.socious.io/ios" target="_blank" rel="noreferrer">
            <img
              src="https://cdn.prod.website-files.com/641bae61d957fd6fba23ae35/64223647a6067be415883965_Apple%20Store%20Badge.webp"
              loading="lazy"
              height="44"
              width="148.5"
              alt="Get Socious on App Store"
            />
          </a>
        </div>
      </div>
      <div>
        <p className={styles['footnote']}>
          The Socious Identity Wallet leverages Self-Sovereign Identity (SSI) to provide secure, decentralized control
          over personal data. It empowers users to manage and share their identity information seamlessly, ensuring
          privacy and trust. Ideal for individuals and organizations focused on transparency and impact.
        </p>
      </div>
    </div>
  );
}

export default Download;
