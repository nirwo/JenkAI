'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import JenkinsApiClient, { JenkinsConnection } from '@/lib/jenkins-api';

interface JenkinsContextType {
  connections: JenkinsConnection[];
  activeConnection: JenkinsConnection | null;
  client: JenkinsApiClient | null;
  isLoading: boolean;
  error: string | null;
  addConnection: (connection: JenkinsConnection) => void;
  removeConnection: (id: string) => void;
  setActiveConnection: (id: string) => void;
  testConnection: (connection: JenkinsConnection) => Promise<boolean>;
}

const JenkinsContext = createContext<JenkinsContextType | undefined>(undefined);

interface JenkinsProviderProps {
  children: ReactNode;
}

export const JenkinsProvider: React.FC<JenkinsProviderProps> = ({ children }) => {
  const [connections, setConnections] = useState<JenkinsConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<JenkinsConnection | null>(null);
  const [client, setClient] = useState<JenkinsApiClient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load connections from localStorage on initial render
  useEffect(() => {
    const savedConnections = localStorage.getItem('jenkins-connections');
    if (savedConnections) {
      try {
        const parsed = JSON.parse(savedConnections);
        setConnections(parsed);
        
        // Set active connection if available
        const activeId = localStorage.getItem('jenkins-active-connection');
        if (activeId) {
          const active = parsed.find((conn: JenkinsConnection) => conn.id === activeId);
          if (active) {
            setActiveConnection(active);
            setClient(new JenkinsApiClient(active));
          }
        }
      } catch (err) {
        console.error('Error loading connections from localStorage:', err);
        setError('Failed to load saved connections');
      }
    }
  }, []);

  // Save connections to localStorage when they change
  useEffect(() => {
    if (connections.length > 0) {
      localStorage.setItem('jenkins-connections', JSON.stringify(connections));
    }
  }, [connections]);

  // Save active connection to localStorage when it changes
  useEffect(() => {
    if (activeConnection) {
      localStorage.setItem('jenkins-active-connection', activeConnection.id);
    } else {
      localStorage.removeItem('jenkins-active-connection');
    }
  }, [activeConnection]);

  const addConnection = (connection: JenkinsConnection) => {
    // Generate ID if not provided
    if (!connection.id) {
      connection.id = Date.now().toString();
    }
    
    setConnections(prev => [...prev, connection]);
    
    // If this is the first connection, set it as active
    if (connections.length === 0) {
      setActiveConnection(connection);
      setClient(new JenkinsApiClient(connection));
    }
  };

  const removeConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
    
    // If removing the active connection, set active to null
    if (activeConnection && activeConnection.id === id) {
      setActiveConnection(null);
      setClient(null);
    }
  };

  const setActive = (id: string) => {
    const connection = connections.find(conn => conn.id === id);
    if (connection) {
      setActiveConnection(connection);
      setClient(new JenkinsApiClient(connection));
    } else {
      setError(`Connection with ID ${id} not found`);
    }
  };

  const testConnection = async (connection: JenkinsConnection): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const testClient = new JenkinsApiClient(connection);
      const result = await testClient.testConnection();
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      setError('Failed to connect to Jenkins server');
      return false;
    }
  };

  const value = {
    connections,
    activeConnection,
    client,
    isLoading,
    error,
    addConnection,
    removeConnection,
    setActiveConnection: setActive,
    testConnection
  };

  return (
    <JenkinsContext.Provider value={value}>
      {children}
    </JenkinsContext.Provider>
  );
};

export const useJenkins = (): JenkinsContextType => {
  const context = useContext(JenkinsContext);
  if (context === undefined) {
    throw new Error('useJenkins must be used within a JenkinsProvider');
  }
  return context;
};
