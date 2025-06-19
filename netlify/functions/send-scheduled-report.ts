export const handler = async (event: any) => {
  // Temporary stub - email functionality disabled due to bundle size
  console.log('Email function called but disabled for deployment');

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Email functionality temporarily disabled",
      note: "Will be restored after bundle optimization"
    }),
  };
};

