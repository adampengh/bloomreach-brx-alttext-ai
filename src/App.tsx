import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import UiExtension from '@bloomreach/ui-extension-saas';
import {
  Backdrop,
  Button,
  CircularProgress,
  Container,
  Grid,
  TextField,
} from '@mui/material';

interface AltTextResponse {
  asset_id: string;
  url: string;
  alt_text: string;
  tags: string[];
  metadata: any;
  created_at: number;
  errors: any;
  error_code: any;
}

function App() {
  const [ui, setUi] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [altText, setAltText] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);

  const containerRef = useRef<any>(null);

  useEffect(() => {
    initAltText();
  }, [document?.mode]);

  const initAltText = async () => {
    const ui = await UiExtension.register();
    setUi(ui);
    const config = await JSON.parse(ui?.extension?.config);
    setApiKey(config?.apiKey);

    const document = await ui.document.get();
    setDocument(document);
    const value = await ui.document.field.getValue();
    setAltText(value);

    if (document?.mode === 'edit') {
      await ui.document.field.setHeight(
        containerRef?.current?.offsetHeight || 300
      );
    } else {
      await ui.document.field.setHeight(
        containerRef?.current?.offsetHeight || 100
      );
    }
  };

  const handleSubmit = () => {
    if (url && apiKey) {
      setLoading(true);
      axios
        .post(
          'https://alttext.ai/api/v1/images',
          {
            image: {
              url: url,
            },
          },
          {
            headers: { 'X-API-Key': apiKey },
          }
        )
        .then((response) => {
          const data: AltTextResponse = response.data;
          setAltText(data.alt_text);
          ui?.document?.field?.setValue(data.alt_text);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error Generated Alt Text:', error);
          setLoading(false);
        });
    }
  };

  if (document && document.mode !== 'edit') {
    return <p>{altText}</p>;
  }

  return (
    <div className='App'>
      <Container
      ref={containerRef}
      disableGutters
      maxWidth={false}
      sx={{ py: 3 }}
    >
      {loading && (
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <GradientCircularProgress />
        </Backdrop>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth={true}
            label='Alt Text'
            variant='outlined'
            value={altText}
            onChange={(event) => setUrl(event?.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth={true}
            label='Image URL'
            variant='outlined'
            value={url}
            onChange={(event) => setUrl(event?.target.value)}
          />
          <Button
            disableElevation
            variant='contained'
            disabled={!url}
            onClick={handleSubmit}
            sx={{ textTransform: 'none' }}
          >
            Generate Alt Text
          </Button>
        </Grid>
      </Grid>
    </Container>
    </div>
  );
}

const GradientCircularProgress = () => {
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id='my_gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
            <stop offset='0%' stopColor='#ffd500' />
            <stop offset='100%' stopColor='#ffd500' />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }}
      />
    </React.Fragment>
  );
};

export default App;
