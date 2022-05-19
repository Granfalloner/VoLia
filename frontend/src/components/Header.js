import React from 'react';

const Header = (props) => {
  return (
    <div className="navbar bg-base-100">
      <div class="navbar-start">
        <a className="btn btn-ghost normal-case text-xl">Volia</a>
      </div>
      <div className="navbar-end">
        <a className="btn">Connect Wallet</a>
      </div>
    </div>
  );
};
export default Header;
