import React, { useState } from 'react';
import { SakuraBackground } from './SakuraBackground';
import { MarketplaceHeader } from './MarketplaceHeader';
import { MarketplaceSidebar } from './MarketplaceSidebar';
import { MarketplaceContent } from './MarketplaceContent';

export const MarketplaceLayout: React.FC = () => {
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  const [activeSection, setActiveSection] = useState('marketplace');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleConnect = (address: string) => {
    setConnectedAddress(address);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <SakuraBackground />
      
      {/* Main Layout */}
      <div className="relative z-10">
        {/* Header */}
        <MarketplaceHeader 
          onConnect={handleConnect}
          onMenuToggle={toggleSidebar}
        />
        
        {/* Main Content Area */}
        <div className="flex">
          {/* Sidebar */}
          <MarketplaceSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            isOpen={sidebarOpen}
            onClose={closeSidebar}
          />
          
          {/* Content */}
          <main className="flex-1 lg:ml-0 p-6">
            <div className="max-w-7xl mx-auto">
              <MarketplaceContent
                activeSection={activeSection}
                connectedAddress={connectedAddress}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};