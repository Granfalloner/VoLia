import React from 'react';
import Logo from './logo.png';

const Header = ({ connectWallet, wallet }) => {
  return (
    <div className="navbar bg-white">
      <div className="navbar-start">
        <a className="btn btn-ghost normal-case text-xl" href="/">
          <img src={Logo} style={{ height: '36px' }} />
        </a>
      </div>
      <div className="navbar-end">
        {!wallet && <button className="btn" onClick={connectWallet}>Connect Wallet</button>}
      </div>
    </div>
  );
};
export default Header;
