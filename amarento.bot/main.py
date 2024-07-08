from typing import Optional, Union
from supabase import create_client, Client
import pandas as pd


def main():
    file_path: str = "./guestlist.xlsx"
    dataframe = process_excel_to_dataframe(file_path, 0)

    guests_list = prepare_data_for_insert(dataframe)
    insert_data_to_supabase(guests_list)


def supabase_client():
    url: str = "https://vloluvdffwoittygfazy.supabase.co"
    key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsb2x1dmRmZndvaXR0eWdmYXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkyNTQ4NzksImV4cCI6MjAzNDgzMDg3OX0.69uc1XHqmHNy777xbLiiou-PuEvm9Rk1NBkdgfzaHlk"
    supabase: Client = create_client(url, key)
    return supabase


def process_excel_to_dataframe(file_path: str, sheet_name: Union[str, int] = 0) -> Optional[pd.DataFrame]:
    """
    Read an excel file and convert it to a pandas dataframe.

    Parameters:
    file_path (str): Path to the Excel file
    sheet_name (Union[str, int]): Name or index of the sheet to read (default is 0, the first sheet)

    Returns:
    Optional[pd.DataFrame]: The data from the Excel file as a DataFrame, or None if an error occurs
    """
    try:
        # Read the Excel file
        df: pd.DataFrame = pd.read_excel(file_path, sheet_name=sheet_name)

        # Basic data cleaning (optional)
        # Remove any rows with all NaN values
        df = df.dropna(how='all')

        # Reset the index if any rows were dropped
        df = df.reset_index(drop=True)

        print(f"Successfully processed Excel file: {file_path}")
        print(f"DataFrame shape: {df.shape}")

        print(df)
        return df

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None


def prepare_data_for_insert(df: pd.DataFrame) -> list:
    """
    Prepare data from DataFrame for insertion into Supabase.
    """
    data_to_insert = []
    for _, row in df.iterrows():
        item = {
            "inv_names": row['names'],
            "wa_number": row['wa_number'],
            "n_rsvp": row['n_RSVP'],
            "address": row['address']
        }
        data_to_insert.append(item)

    return data_to_insert


def insert_data_to_supabase(data: list) -> None:
    """
    Insert data into supabase table.
    """
    try:
        supabase = supabase_client()
        result = supabase.table('guests').insert(data).execute()
        print(f"Successfully inserted {len(data)} rows into Supabase.")
    except Exception as e:
        print(f"An error occurred while inserting data: {str(e)}")


if __name__ == "__main__":
    main()
