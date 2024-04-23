import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TablePagination } from '@mui/material';
import './App.css';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '10px',
  overflow: 'hidden',
  
};

let datax=[]
function App() {
  const [data, setData] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  console.log(datax)
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002/');

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      console.log('Received data:', newData);
      setData(newData);
      if(datax.length > 5) {
        datax.pop()
      }
      datax.unshift(newData)
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderTable = () => {
    if (!data) {
      return <CircularProgress />;
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tower ID</TableCell>
              <TableCell>Temperature</TableCell>
              <TableCell>Fuel Status</TableCell>
              <TableCell>Power source</TableCell>
              <TableCell>Anamoly</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datax?.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.towerId}</TableCell>
                <TableCell>{row.temperature}</TableCell>
                <TableCell>{row.fuelStatus}</TableCell>
                <TableCell>{row.powerSource}</TableCell>
                <TableCell>{row.anomaly?.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Security Alarm</h1>
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: 0, lng: 0 }}
            zoom={1}
          >
            {datax && (
              datax.map((item,index) => {
               if(item.anomaly.status ){
                return <Marker position={{ lat: item.location.lat, lng: item.location.long }}
                onMouseOver={() => setHovered(true)}
                onMouseOut={() => setHovered(false)}
                >
                {
                  hovered && (
                    
                    <div
                    style={{
                      position: 'absolute',
                      top: data.location.lat,
                      left: data.location.long,
                      backgroundColor: 'white',
                      padding: '5px',
                      borderRadius: '5px',
                      color: 'black',
                      font:'5px',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                      zIndex: 1000,
                    }}
                    >
                      <p>fuelStatus: {item.anomaly.fuelStatus}</p>
                      <p>Temperature: {item.anomaly.temprature}</p>
                      <p>Timestamp: {item.anomaly.powerSource}</p>
                    </div>
                  
                  )
                }
              </Marker>
               }
              })
            )}
          </GoogleMap>
        </div>
        {renderTable()}
        {data && (
          <TablePagination
           
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </header>
    </div>
  );
}

export default App;
