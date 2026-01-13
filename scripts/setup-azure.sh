#!/bin/bash

# TERRAS Azure Setup Script
# Script untuk membuat Azure resources yang diperlukan

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 TERRAS Azure Setup"
echo "====================="
echo ""

# Configuration
RESOURCE_GROUP="terras-rg"
LOCATION="southeastasia"  # Singapore region
ACR_NAME="terrasregistry"  # Change if needed (must be globally unique)

echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location:       $LOCATION"
echo "  ACR Name:       $ACR_NAME"
echo ""

read -p "Continue with this configuration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Step 1: Check Azure CLI
echo -e "${YELLOW}[1/6] Checking Azure CLI...${NC}"
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI not found${NC}"
    echo "Please install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi
echo -e "${GREEN}✓ Azure CLI found${NC}"
echo ""

# Step 2: Login to Azure
echo -e "${YELLOW}[2/6] Checking Azure login...${NC}"
if ! az account show &> /dev/null; then
    echo "Please login to Azure..."
    az login
fi
echo -e "${GREEN}✓ Logged in${NC}"
echo ""

# Display subscription
echo "Current subscription:"
az account show --query "{Name:name, SubscriptionId:id}" -o table
echo ""

# Step 3: Create Resource Group
echo -e "${YELLOW}[3/6] Creating resource group...${NC}"
if az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo -e "${YELLOW}⚠ Resource group already exists${NC}"
else
    az group create --name $RESOURCE_GROUP --location $LOCATION
    echo -e "${GREEN}✓ Resource group created${NC}"
fi
echo ""

# Step 4: Create Container Registry
echo -e "${YELLOW}[4/6] Creating Azure Container Registry...${NC}"
if az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo -e "${YELLOW}⚠ ACR already exists${NC}"
else
    az acr create \
        --resource-group $RESOURCE_GROUP \
        --name $ACR_NAME \
        --sku Basic \
        --location $LOCATION \
        --admin-enabled true
    echo -e "${GREEN}✓ ACR created${NC}"
fi
echo ""

# Step 5: Get ACR credentials
echo -e "${YELLOW}[5/6] Getting ACR credentials...${NC}"
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

echo -e "${GREEN}✓ Credentials retrieved${NC}"
echo ""

# Step 6: Create Container Apps Environment
echo -e "${YELLOW}[6/6] Creating Container Apps Environment...${NC}"

# Install extension if needed
if ! az extension show --name containerapp &> /dev/null; then
    echo "Installing containerapp extension..."
    az extension add --name containerapp --upgrade
fi

# Create environment
if az containerapp env show --name terras-env --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo -e "${YELLOW}⚠ Container Apps Environment already exists${NC}"
else
    az containerapp env create \
        --name terras-env \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION
    echo -e "${GREEN}✓ Container Apps Environment created${NC}"
fi
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}Azure Setup Complete! 🎉${NC}"
echo "======================================"
echo ""
echo "Resources created:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location:       $LOCATION"
echo "  ACR Name:       $ACR_NAME"
echo "  ACR URL:        ${ACR_NAME}.azurecr.io"
echo "  Environment:    terras-env"
echo ""
echo "ACR Credentials:"
echo "  Username: $ACR_USERNAME"
echo "  Password: $ACR_PASSWORD"
echo ""
echo -e "${YELLOW}⚠ Save these credentials securely!${NC}"
echo ""
echo "Next steps:"
echo "1. Build your Docker images locally"
echo "2. Run: ./scripts/push-to-acr.sh $ACR_NAME"
echo "3. Deploy to Azure Container Apps"
echo ""

# Save credentials to file
CREDS_FILE=".azure-credentials"
cat > $CREDS_FILE << EOF
# Azure Credentials for TERRAS
# Generated: $(date)

RESOURCE_GROUP=$RESOURCE_GROUP
LOCATION=$LOCATION
ACR_NAME=$ACR_NAME
ACR_URL=${ACR_NAME}.azurecr.io
ACR_USERNAME=$ACR_USERNAME
ACR_PASSWORD=$ACR_PASSWORD
EOF

echo -e "${GREEN}✓ Credentials saved to $CREDS_FILE${NC}"
echo -e "${YELLOW}⚠ Add $CREDS_FILE to .gitignore!${NC}"
