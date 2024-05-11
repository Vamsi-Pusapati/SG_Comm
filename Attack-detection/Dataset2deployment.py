#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
#import tensorflow.keras.optimizers
import tensorflow.compat.v1
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import KFold
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from datetime import datetime

# Read your CSV file
df = pd.read_csv('./smart_grid_stability_augmented.csv')

# Drop rows with missing values
df.dropna(inplace=True)

# Filter out infinity values only from numeric columns
numeric_columns = df.select_dtypes(include=[np.number]).columns
for column in numeric_columns:
    is_infinite = np.isinf(df[column])
    df = df[~is_infinite]

# Remove columns with all 0 values
zero_columns = df.columns[(df == 0).all()]
df = df.drop(columns=zero_columns)

print('The dataset contains', df.shape[0], 'rows and', df.shape[1], 'columns')
df.head()


# In[2]:


print(df.columns)



# In[3]:


df.marker.unique() # Lets the program know how accurate it is



# In[4]:


# Use one-hot encoding to convert the 'marker' column
df_encoded = pd.get_dummies(df, columns=['marker'], drop_first=True) 

# Check the column names after encoding
print(df_encoded.columns)

# Calculate the correlation matrix
corr_matrix = df_encoded.corr()
corr_matrix



# In[5]:


# Column to keep regardless of threshold
column_to_keep = 'marker_Natural'

# Create a set to store the columns to remove
columns_to_remove = set()

# Define the correlation threshold
correlation_threshold = 0.7  # Adjust this threshold as needed (0.85)

# Iterate through the columns and find pairs with correlations above or below the threshold
for i in range(len(corr_matrix.columns)):
    for j in range(i):
        correlation_value = corr_matrix.iloc[i, j]
        if abs(correlation_value) >= correlation_threshold:  
            col_i = corr_matrix.columns[i]
            col_j = corr_matrix.columns[j]

            # Choose one column to remove (you can customize this logic)
            # For example, you can choose the column with the shorter name
            if len(col_i) <= len(col_j):
                if (column_to_keep != col_j):
                    columns_to_remove.add(col_j)
            else:
                if (column_to_keep != col_i):
                    columns_to_remove.add(col_i)

# Remove the identified columns
df_encoded_filtered = df_encoded.drop(columns=columns_to_remove)


# In[6]:


def correlation_map(f_data, f_feature, f_number):
    """
    Develops and displays a heatmap plot referenced to a primary feature of a dataframe, highlighting
    the correlation among the 'n' mostly correlated features of the dataframe.
    
    Keyword arguments:
    
    f_data      Tensor containing all relevant features, including the primary.
                Pandas dataframe
    f_feature   The primary feature.
                String
    f_number    The number of features most correlated to the primary feature.
                Integer
    """
    f_most_correlated = f_data.corr().nlargest(f_number,f_feature)[f_feature].index
    f_correlation = f_data[f_most_correlated].corr()
    
    f_mask = np.zeros_like(f_correlation)
    f_mask[np.triu_indices_from(f_mask)] = True
    with sns.axes_style("white"): 
        f_fig, f_ax = plt.subplots(figsize=(12, 12))
        sns.heatmap(f_correlation, mask=f_mask, vmin=-1, vmax=1, square=True,
                    center=0, annot=False, annot_kws={"size": 8}, cmap="PRGn")
    plt.show()



# In[7]:


print(df_encoded_filtered.columns)


# In[8]:


# Select 'marker_Natural' as the primary feature
correlation_map(df_encoded_filtered, 'marker_Natural', 37)



# In[9]:


#import pandas as pd
#import numpy as np
#import matplotlib.pyplot as plt
#import seaborn as sns

# Define the assessment function
def assessment(f_data, f_y_feature, f_x_feature, f_index=-1):
    """
    Develops and displays a histogram and a scatter plot for a dependent / independent variable pair from
    a dataframe and, optionally, highlights a specific observation on the plot in a different color (red).
    
    Also optionally, if an independent feature is not informed, the scatterplot is not displayed.
    
    Keyword arguments:
    
    f_data      DataFrame containing the dependent / independent variable pair.
                Pandas DataFrame
    f_y_feature Dependent variable designation (e.g., 'marker_Attack').
                String
    f_x_feature Independent variable designation (e.g., column name).
                String
    f_index     If greater or equal to zero, the observation denoted by f_index will be plotted in red.
                Integer
    """
    # Determine the color for plotting
    if f_index >= 0:
        f_color = np.where(f_data.index == f_index, 'r', 'g')
        f_hue = None
    else:
        f_color = 'b'
        f_hue = None
    
    # Create subplots for histogram and scatter plot
    f_fig, f_a = plt.subplots(1, 2, figsize=(16, 4))
    
    # Plot histogram using sns.histplot with a fixed number of bins
    f_chart1 = sns.histplot(f_data[f_x_feature], ax=f_a[0], bins=30, color='g')
    f_chart1.set_xlabel(f_x_feature, fontsize=10)
    
    # Plot scatter plot (if independent feature is provided)
    if f_index >= 0:
        f_chart2 = plt.scatter(f_data[f_x_feature], f_data[f_y_feature], c=f_color, edgecolors='w')
        f_chart2 = plt.xlabel(f_x_feature, fontsize=10)
        f_chart2 = plt.ylabel(f_y_feature, fontsize=10)
    else:
        f_chart2 = sns.scatterplot(x=f_x_feature, y=f_y_feature, data=f_data, hue=f_hue, legend=False)
        f_chart2.set_xlabel(f_x_feature, fontsize=10)
        f_chart2.set_ylabel(f_y_feature, fontsize=10)

    plt.show()

# Assess relationships for 'marker_Natural' and other columns in df_encoded_filtered
for column in df_encoded_filtered.columns:
    if column != 'marker_Natural':  # Skip the dependent variable itself
        assessment(df_encoded_filtered, 'marker_Natural', column, -1)


# In[10]:


df_encoded_filtered.shape



# In[11]:


lengthCol = len(df_encoded_filtered.columns)



# In[12]:


X = df_encoded_filtered.iloc[:, :(lengthCol-2)] # Note: two less than df_encoded_filtered.shape column
y = df_encoded_filtered.iloc[:, (lengthCol-1)] # Note: one less than df_encoded_filtered.shape column
y



# In[13]:


X_training = X.iloc[:3500, :]
y_training = y.iloc[:3500]

X_testing = X.iloc[3500:, :]
y_testing = y.iloc[3500:]

ratio_training = y_training.value_counts(normalize=True)
ratio_testing = y_testing.value_counts(normalize=True)
ratio_training, ratio_testing


# In[14]:


X_training = X_training.values
y_training = y_training.values

X_testing = X_testing.values
y_testing = y_testing.values

X_testing



# In[15]:


y_testing



# In[16]:


scaler = StandardScaler()
X_training = scaler.fit_transform(X_training)
X_testing = scaler.transform(X_testing)



# In[17]:


get_ipython().system('pip install keras')
get_ipython().system('pip install tensorflow==2.14.1')


# In[18]:


from keras.models import Sequential
from keras.layers import Dense, Input

# Initialize the classifier as a Sequential model
classifier = Sequential()

# Define the input shape explicitly using an Input layer
classifier.add(Input(shape=(lengthCol-2,)))

# First hidden layer
classifier.add(Dense(units=lengthCol-2, kernel_initializer='uniform', activation='relu'))

# Second hidden layer
classifier.add(Dense(units=lengthCol-2, kernel_initializer='uniform', activation='sigmoid'))

# Third hidden layer (seems to serve the same role as the second)
classifier.add(Dense(units=lengthCol-2, kernel_initializer='uniform', activation='sigmoid'))

# Output layer with a single node (for binary classification)
classifier.add(Dense(units=1, kernel_initializer='uniform', activation='sigmoid'))

# Compile the ANN
classifier.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])




# In[19]:


cross_val_round = 1
print(f'Model evaluation\n')

for train_index, val_index in KFold(20, shuffle=True, random_state=10).split(X_training):
    x_train, x_val = X_training[train_index], X_training[val_index]
    y_train ,y_val = y_training[train_index], y_training[val_index]
    # (Epochs): used to separate training into distinct phases, which is useful for logging and periodic evaluation.
    # Therefore, the more epochs, the more the model is trained.
    classifier.fit(x_train, y_train, epochs=25, verbose=0)
    classifier_loss, classifier_accuracy = classifier.evaluate(x_val, y_val)
    print(f'Round {cross_val_round} - Loss: {classifier_loss:.4f} | Accuracy: {classifier_accuracy * 100:.2f} %')
    cross_val_round += 1



# In[20]:


y_pred = classifier.predict(X_testing)
y_pred



# In[21]:


# Fixes binary errors with confusion_matrix
y_pred[y_pred <= 0.5] = 0
y_pred[y_pred > 0.5] = 1



# In[22]:


confusion_matrix(y_testing, y_pred)


# In[23]:


cm = pd.DataFrame(data=confusion_matrix(y_testing, y_pred, labels=[0, 1]),
                  index=["Actual Attack", "Actual Natural"],
                  columns=["Predicted Attack", "Predicted Natural"])
cm



# In[24]:


print(f'Accuracy per the confusion matrix: {((cm.iloc[0, 0] + cm.iloc[1, 1]) / len(y_testing) * 100):.2f}%')



# In[25]:


import boto3
import os

# Specify your S3 bucket name
bucket_name = 'smartgrid-cc1'

# Specify the local directory you want to upload from
local_directory = './'
filename = "smart_grid_stability_augmented.csv"

# Specify the prefix (folder in S3) where you want to store your files
s3_prefix = 'data'

# Create an S3 resource object
s3_resource = boto3.resource('s3')

# Get the bucket object
bucket = s3_resource.Bucket(bucket_name)

# Function to upload files
def upload_files(path, bucket_name, prefix):
    """
    Uploads all files from a local path to an S3 bucket, preserving the subdirectory structure.
    """
    
    for root, dirs, files in os.walk(path):
        for file in files:
            if(file == filename):
                local_path = os.path.join(root, file)
                relative_path = os.path.relpath(local_path, path)
                s3_path = os.path.join(prefix, relative_path)

                print(f"Uploading {local_path} to {s3_path}...")
                bucket.upload_file(local_path, s3_path)

# Calling the function to upload files
upload_files(local_directory, bucket_name, s3_prefix)

print("Upload completed.")


# In[51]:


import os
import tensorflow as tf

# Assuming 'classifier' is your trained model
model_dir = './model_output/000000001'  # Include the version number in the path
os.makedirs(model_dir, exist_ok=True)  # Ensure the directory exists
tf.saved_model.save(classifier, model_dir)

# Zip the directory, starting from the parent of the version folder
get_ipython().system('tar -czvf model.tar.gz -C ./model_output .')


# In[53]:


import tarfile
import os

def make_tarfile(output_filename, source_dir):
    with tarfile.open(output_filename, "w:gz") as tar:
        tar.add(source_dir, arcname=os.path.basename(source_dir))

# Path where the TensorFlow model should be saved
model_version_dir = '/home/ec2-user/SageMaker/model_output/000000001'
os.makedirs(model_version_dir, exist_ok=True)  # Ensure the version directory exists

# Define the output file and source directory for packaging
output_filename = '/home/ec2-user/SageMaker/model.tar.gz'
source_dir = '/home/ec2-user/SageMaker/model_output'

# Create the tar.gz file
make_tarfile(output_filename, source_dir)G

# Now, check the file without trying to open or edit it
get_ipython().system('ls -lh /home/ec2-user/SageMaker/model.tar.gz')


# In[54]:


import os
import boto3
import sagemaker

# Initialize SageMaker session (appears unused in this snippet)
sagemaker_session = sagemaker.Session()

# Get the custom bucket name
bucket = "smartgrid-cc1"

# Define the S3 path
prefix = 'model'
model_path = f's3://{bucket}/{prefix}/model.tar.gz'

# Prepare the resource
s3_resource = boto3.resource('s3')

# Define output filename
output_filename = '/home/ec2-user/SageMaker/model.tar.gz'  # Ensure this is the correct path to your .tar.gz file

# Try uploading with exception handling
try:
    s3_resource.Bucket(bucket).Object(os.path.join(prefix, 'model.tar.gz')).upload_file(output_filename)
    print("Upload successful!")
except Exception as e:
    print(f"Failed to upload due to: {str(e)}")


# In[55]:


from sagemaker.tensorflow import TensorFlowModel

role = sagemaker.get_execution_role()  # Ensure the role is correctly initialized
bucket = "smartgrid-cc1"
prefix = 'model'
model_path = f's3://{bucket}/{prefix}/model.tar.gz'

# Initialize the TensorFlow model with the correct framework_version
model = TensorFlowModel(model_data=model_path,
                        role=role,
                        framework_version="2.14.1")

# Deploy the model specifying the instance type
predictor = model.deploy(initial_instance_count=1, instance_type='ml.t2.medium')


# In[56]:


predictor.endpoint


# In[ ]:


predictor.predict()


# In[61]:


X_testing[1]


# In[60]:


y_pred


# In[ ]:




