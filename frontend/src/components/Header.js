import React from 'react';
import Logo from './logo.png';

const Header = (props) => {
  return (
    <div className="navbar bg-white">
      <div className="navbar-start">
        <a className="btn btn-ghost normal-case text-xl">
          <img src={Logo} />
        </a>
      </div>
      <div className="navbar-end">
        <a className="btn">Connect Wallet</a>
      </div>
    </div>
  );
};
export default Header;
